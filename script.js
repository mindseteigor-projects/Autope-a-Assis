/* =========================
   CONFIGURAÇÕES
========================= */

const SUPABASE_URL =
    "https://efnajcayxuxubpdljsqw.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_5_veDMZ8ni1WghmwSujh7Q_i8wwFEwK";

const WHATSAPP =
    "5541999141210";


const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


/* =========================
   VARIÁVEIS
========================= */

let products = [];

let cart = [];


/* =========================
   PRODUTOS
========================= */

async function carregarProdutos() {

    const { data, error } =
        await supabaseClient
            .from("products")
            .select("*")
            .eq("active", true)
            .order("id", {
                ascending: true
            });


    if (error) {

        console.error(
            "Erro ao carregar produtos:",
            error
        );

        document.getElementById("products").innerHTML = `
            <p>
                Não foi possível carregar os produtos.
            </p>
        `;

        return;

    }


    products = data || [];

    renderProdutos();

}


/* =========================
   RENDERIZAR PRODUTOS
========================= */

function renderProdutos() {

    const container =
        document.getElementById("products");


    if (!products.length) {

        container.innerHTML = `
            <p>
                Nenhum produto disponível no momento.
            </p>
        `;

        return;

    }


    container.innerHTML =
        products.map(
            (product, index) => {

                return `

                    <div class="product">

                        <div class="product-image">

                            ${
                                product.image_url
                                || "🔧"
                            }

                        </div>


                        <div class="product-info">

                            <div class="product-category">

                                ${
                                    product.category
                                    || "Autopeças"
                                }

                            </div>


                            <h3>

                                ${
                                    product.name
                                }

                            </h3>


                            <div class="price">

                                R$
                                ${
                                    Number(
                                        product.price
                                    ).toFixed(2).replace(
                                        ".",
                                        ","
                                    )
                                }

                            </div>


                            <button
                                class="add-button"
                                onclick="addToCart(${index})">

                                Adicionar ao carrinho

                            </button>

                        </div>

                    </div>

                `;

            }
        ).join("");

}


/* =========================
   CARRINHO
========================= */

function addToCart(index) {

    const product =
        products[index];


    const existing =
        cart.find(
            item =>
                item.product.id === product.id
        );


    if (existing) {

        existing.quantity++;

    } else {

        cart.push({

            product: product,

            quantity: 1

        });

    }


    atualizarContador();

    toast(
        "Produto adicionado ao carrinho"
    );

}


/* =========================
   CONTADOR
========================= */

function atualizarContador() {

    const count =
        cart.reduce(
            (total, item) =>
                total + item.quantity,
            0
        );


    document.getElementById(
        "count"
    ).textContent = count;

}


/* =========================
   ABRIR CARRINHO
========================= */

function openCart() {

    document.getElementById(
        "modalTitle"
    ).textContent =
        "Seu carrinho e orçamento";


    const body =
        document.getElementById(
            "modalBody"
        );


    if (!cart.length) {

        body.innerHTML = `

            <p>
                Seu carrinho está vazio.
            </p>

            <button
                class="primary-button"
                onclick="closeModal()">

                Continuar comprando

            </button>

        `;


        abrirModal();

        return;

    }


    body.innerHTML = `

        <div class="cart-list">

            ${
                cart.map(
                    (item, index) => `

                        <div class="cart-row">

                            <div>

                                <strong>
                                    ${
                                        item.product.name
                                    }
                                </strong>

                                <br>

                                <small>

                                    R$
                                    ${
                                        Number(
                                            item.product.price
                                        ).toFixed(2).replace(
                                            ".",
                                            ","
                                        )
                                    }

                                </small>

                            </div>


                            <div class="quantity">

                                <button
                                    onclick="alterarQuantidade(
                                        ${index},
                                        -1
                                    )">

                                    −

                                </button>


                                ${
                                    item.quantity
                                }


                                <button
                                    onclick="alterarQuantidade(
                                        ${index},
                                        1
                                    )">

                                    +

                                </button>

                            </div>

                        </div>

                    `
                ).join("")
            }

        </div>


        <p
            style="
                color:var(--muted);
                font-size:13px;
            ">

            Quer orçamento das peças,
            instalação ou algum serviço junto?
            Preencha os dados abaixo.

        </p>


        <div class="field">

            <label>
                Seu nome
            </label>

            <input
                id="cn"
                placeholder="Digite seu nome">

        </div>


        <div class="field">

            <label>
                Modelo do carro
            </label>

            <input
                id="cm"
                placeholder="Ex.: Chevrolet Onix 1.0">

        </div>


        <div class="field">

            <label>
                Ano
            </label>

            <input
                id="cy"
                placeholder="Ex.: 2022">

        </div>


        <div class="field">

            <label>
                Serviço / observação
            </label>

            <textarea
                id="cs"
                placeholder="Ex.: instalar as peças, troca de óleo, revisão...">
            </textarea>

        </div>


        <button
            class="send-button"
            onclick="enviarOrcamentoCarrinho()">

            Solicitar orçamento completo pelo WhatsApp →

        </button>

    `;


    abrirModal();

}


/* =========================
   QUANTIDADE
========================= */

function alterarQuantidade(
    index,
    quantidade
) {

    cart[index].quantity +=
        quantidade;


    if (
        cart[index].quantity <= 0
    ) {

        cart.splice(index, 1);

    }


    atualizarContador();

    openCart();

}


/* =========================
   ORÇAMENTO DO CARRINHO
========================= */

function enviarOrcamentoCarrinho() {

    const nome =
        document
            .getElementById("cn")
            .value
            .trim();


    const modelo =
        document
            .getElementById("cm")
            .value
            .trim();


    const ano =
        document
            .getElementById("cy")
            .value
            .trim();


    const servico =
        document
            .getElementById("cs")
            .value
            .trim();


    if (
        !nome ||
        !modelo ||
        !ano
    ) {

        alert(
            "Preencha nome, modelo do carro e ano."
        );

        return;

    }


    const itens =
        cart.map(
            item => {

                return (
                    "• " +
                    item.product.name +
                    " — " +
                    item.quantity +
                    " unidade(s)"
                );

            }
        ).join("\n");


    const mensagem =

`Olá! Gostaria de solicitar um orçamento completo.

Nome: ${nome}

Veículo: ${modelo}

Ano: ${ano}

Peças selecionadas:

${itens}

Serviço/observação:
${servico || "Não informado"}

Gostaria de confirmar disponibilidade, valor das peças e, se necessário, valor da instalação/serviço.`;


    window.open(
        "https://wa.me/" +
        WHATSAPP +
        "?text=" +
        encodeURIComponent(
            mensagem
        ),
        "_blank"
    );

}


/* =========================
   ORÇAMENTO SEM CARRINHO
========================= */

function openBudget() {

    document.getElementById(
        "modalTitle"
    ).textContent =
        "Solicitar orçamento";


    document.getElementById(
        "modalBody"
    ).innerHTML = `

        <div class="field">

            <label>
                Seu nome
            </label>

            <input
                id="n"
                placeholder="Digite seu nome">

        </div>


        <div class="field">

            <label>
                Modelo do carro
            </label>

            <input
                id="m"
                placeholder="Ex.: Chevrolet Onix 1.0">

        </div>


        <div class="field">

            <label>
                Ano
            </label>

            <input
                id="y"
                placeholder="Ex.: 2022">

        </div>


        <div class="field">

            <label>
                O que você precisa?
            </label>

            <textarea
                id="s"
                placeholder="Ex.: Troca de pastilhas de freio, revisão, peça específica...">
            </textarea>

        </div>


        <button
            class="send-button"
            onclick="enviarOrcamento()">

            Enviar orçamento pelo WhatsApp →

        </button>

    `;


    abrirModal();

}


/* =========================
   ENVIAR ORÇAMENTO
========================= */

function enviarOrcamento() {

    const nome =
        document
            .getElementById("n")
            .value
            .trim();


    const modelo =
        document
            .getElementById("m")
            .value
            .trim();


    const ano =
        document
            .getElementById("y")
            .value
            .trim();


    const solicitacao =
        document
            .getElementById("s")
            .value
            .trim();


    if (
        !nome ||
        !modelo ||
        !ano ||
        !solicitacao
    ) {

        alert(
            "Preencha todos os campos para continuar."
        );

        return;

    }


    const mensagem =

`Olá! Gostaria de solicitar um orçamento.

Nome: ${nome}

Veículo: ${modelo}

Ano: ${ano}

Solicitação:
${solicitacao}

Aguardo o orçamento. Obrigado!`;


    window.open(
        "https://wa.me/" +
        WHATSAPP +
        "?text=" +
        encodeURIComponent(
            mensagem
        ),
        "_blank"
    );

}


/* =========================
   PAINEL ADMINISTRATIVO
========================= */

function openAdmin() {

    document.getElementById(
        "modalTitle"
    ).textContent =
        "Painel administrativo";


    document.getElementById(
        "modalBody"
    ).innerHTML = `

        <p
            style="
                color:var(--muted);
            ">

            Gerencie produtos,
            preços e estoque.

        </p>


        <div class="field">

            <label>
                Novo produto
            </label>

            <input
                id="an"
                placeholder="Nome do produto">

        </div>


        <div class="field">

            <label>
                Categoria
            </label>

            <input
                id="ac"
                placeholder="Ex.: Freios">

        </div>


        <div class="field">

            <label>
                Preço
            </label>

            <input
                id="ap"
                placeholder="Ex.: 149,90">

        </div>


        <div class="field">

            <label>
                Ícone
            </label>

            <input
                id="ae"
                value="🔧">

        </div>


        <div class="field">

            <label>
                Estoque inicial
            </label>

            <input
                id="as"
                type="number"
                min="0"
                value="1">

        </div>


        <button
            class="primary-button"
            style="
                width:100%;
                border:none;
                margin-bottom:18px;
            "
            onclick="cadastrarProduto()">

            Cadastrar produto

        </button>


        <div id="adminList"></div>

    `;


    abrirModal();

    renderAdmin();

}


/* =========================
   LISTA ADMIN
========================= */

function renderAdmin() {

    const container =
        document.getElementById(
            "adminList"
        );


    if (!container) {
        return;
    }


    if (!products.length) {

        container.innerHTML =
            "<p>Nenhum produto cadastrado.</p>";

        return;

    }


    container.innerHTML = `

        <h3>
            Produtos cadastrados
        </h3>

        ${
            products.map(
                (product, index) => `

                    <div class="admin-product">

                        <strong>
                            ${
                                product.name
                            }
                        </strong>

                        <br>

                        <small>

                            ${
                                product.category
                                || "Sem categoria"
                            }

                            ·

                            R$
                            ${
                                Number(
                                    product.price
                                ).toFixed(2).replace(
                                    ".",
                                    ","
                                )
                            }

                        </small>


                        <div class="admin-actions">

                            <button
                                class="admin-small-button"
                                onclick="alterarEstoque(
                                    ${index},
                                    -1
                                )">

                                −

                            </button>


                            <strong>

                                Estoque:
                                ${
                                    product.stock
                                    ?? 0
                                }

                            </strong>


                            <button
                                class="admin-small-button"
                                onclick="alterarEstoque(
                                    ${index},
                                    1
                                )">

                                +

                            </button>


                            <button
                                class="admin-small-button delete-button"
                                onclick="excluirProduto(
                                    ${index}
                                )">

                                Excluir

                            </button>

                        </div>

                    </div>

                `
            ).join("")
        }

    `;

}


/* =========================
   CADASTRAR PRODUTO
========================= */

async function cadastrarProduto() {

    const nome =
        document
            .getElementById("an")
            .value
            .trim();


    const categoria =
        document
            .getElementById("ac")
            .value
            .trim();


    const precoTexto =
        document
            .getElementById("ap")
            .value
            .trim()
            .replace(",", ".");


    const preco =
        Number(precoTexto);


    const icone =
        document
            .getElementById("ae")
            .value
            .trim()
        || "🔧";


    const estoque =
        Number(
            document
                .getElementById("as")
                .value
        );


    if (
        !nome ||
        !categoria ||
        !precoTexto ||
        Number.isNaN(preco) ||
        estoque < 0
    ) {

        alert(
            "Preencha nome, categoria, preço e estoque."
        );

        return;

    }


    const {
        data,
        error
    } =
        await supabaseClient
            .from("products")
            .insert({

                name: nome,

                category: categoria,

                price: preco,

                stock: estoque,

                description: "",

                image_url: icone,

                active: true

            })
            .select()
            .single();


    if (error) {

        console.error(error);

        alert(
            "Erro ao cadastrar produto: " +
            error.message
        );

        return;

    }


    products.push(data);

    renderProdutos();

    openAdmin();

    toast(
        "Produto cadastrado"
    );

}


/* =========================
   ALTERAR ESTOQUE
========================= */

async function alterarEstoque(
    index,
    quantidade
) {

    const product =
        products[index];


    const estoqueAtual =
        Number(
            product.stock || 0
        );


    const novoEstoque =
        Math.max(
            0,
            estoqueAtual + quantidade
        );


    const {
        error
    } =
        await supabaseClient
            .from("products")
            .update({

                stock: novoEstoque

            })
            .eq(
                "id",
                product.id
            );


    if (error) {

        console.error(error);

        alert(
            "Erro ao alterar estoque: " +
            error.message
        );

        return;

    }


    product.stock =
        novoEstoque;


    renderProdutos();

    openAdmin();

}


/* =========================
   EXCLUIR PRODUTO
========================= */

async function excluirProduto(
    index
) {

    const product =
        products[index];


    const confirmar =
        confirm(
            "Excluir este produto?"
        );


    if (!confirmar) {
        return;
    }


    const {
        error
    } =
        await supabaseClient
            .from("products")
            .delete()
            .eq(
                "id",
                product.id
            );


    if (error) {

        console.error(error);

        alert(
            "Erro ao excluir produto: " +
            error.message
        );

        return;

    }


    products.splice(
        index,
        1
    );


    renderProdutos();

    openAdmin();

    toast(
        "Produto removido"
    );

}


/* =========================
   MODAL
========================= */

function abrirModal() {

    document
        .getElementById("modal")
        .classList.add("open");

}


function closeModal() {

    document
        .getElementById("modal")
        .classList.remove("open");

}


/* =========================
   NOTIFICAÇÃO
========================= */

function toast(
    mensagem
) {

    const elemento =
        document.createElement(
            "div"
        );


    elemento.textContent =
        mensagem;


    elemento.style = `

        position:fixed;

        bottom:22px;

        right:22px;

        background:#111827;

        color:white;

        padding:13px 17px;

        border-radius:10px;

        z-index:50;

        font-weight:800;

    `;


    document.body.appendChild(
        elemento
    );


    setTimeout(
        () => {

            elemento.remove();

        },
        1800
    );

}


/* =========================
   INICIALIZAÇÃO
========================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        carregarProdutos();

    }
);