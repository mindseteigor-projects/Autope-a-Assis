/* =========================================
   CONFIGURAÇÃO
========================================= */

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


/* =========================================
   VARIÁVEIS
========================================= */

let produtos = [];

let carrinho = [];

let usuarioAdmin = null;


/* =========================================
   CARREGAR PRODUTOS DO SUPABASE
========================================= */

async function carregarProdutos() {

    const container =
        document.getElementById("products");

    container.innerHTML =
        `<div class="loading">
            Carregando produtos...
        </div>`;


    const { data, error } =
        await supabaseClient
            .from("products")
            .select("*")
            .eq("active", true)
            .order("created_at", {
                ascending: false
            });


    if (error) {

        console.error(error);

        container.innerHTML =
            `<div class="loading">
                Não foi possível carregar os produtos.
            </div>`;

        return;
    }


    produtos = data || [];

    renderProdutos();
}


/* =========================================
   MOSTRAR PRODUTOS
========================================= */

function renderProdutos() {

    const container =
        document.getElementById("products");


    if (!produtos.length) {

        container.innerHTML =
            `<div class="loading">
                Nenhum produto cadastrado ainda.
            </div>`;

        return;
    }


    container.innerHTML =
        produtos.map(produto => {

            const imagem =
                produto.image_url
                    ? `<img
                        src="${produto.image_url}"
                        alt="${produto.name}"
                        style="width:100%;height:100%;object-fit:cover;"
                       >`
                    : "🔧";


            return `
                <div class="product">

                    <div class="product-image">
                        ${imagem}
                    </div>

                    <div class="product-info">

                        <div class="product-category">
                            ${produto.category || "Autopeças"}
                        </div>

                        <h3>
                            ${produto.name}
                        </h3>

                        <div class="product-price">
                            ${formatarPreco(produto.price)}
                        </div>

                        <div class="stock">
                            ${
                                produto.stock > 0
                                ? `${produto.stock} unidades disponíveis`
                                : "Produto esgotado"
                            }
                        </div>

                        <button
                            class="add-button"
                            onclick="adicionarCarrinho(${produto.id})"
                            ${produto.stock <= 0 ? "disabled" : ""}
                        >
                            ${
                                produto.stock > 0
                                ? "Adicionar ao carrinho"
                                : "Esgotado"
                            }
                        </button>

                    </div>

                </div>
            `;

        }).join("");
}


/* =========================================
   FORMATAÇÃO DE PREÇO
========================================= */

function formatarPreco(valor) {

    return Number(valor).toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );
}


/* =========================================
   CARRINHO
========================================= */

function adicionarCarrinho(id) {

    const produto =
        produtos.find(p => p.id === id);

    if (!produto) return;


    const item =
        carrinho.find(item => item.id === id);


    if (item) {

        if (item.quantidade < produto.stock) {

            item.quantidade++;

        } else {

            alert("Você atingiu o estoque disponível.");

            return;
        }

    } else {

        carrinho.push({
            id: produto.id,
            quantidade: 1
        });

    }


    atualizarCarrinho();

    mostrarAviso(
        "Produto adicionado ao carrinho!"
    );
}


/* =========================================
   ATUALIZAR CONTADOR
========================================= */

function atualizarCarrinho() {

    const total =
        carrinho.reduce(
            (soma, item) =>
                soma + item.quantidade,
            0
        );


    document.getElementById("count")
        .textContent = total;
}


/* =========================================
   ABRIR CARRINHO
========================================= */

function openCart() {

    document.getElementById(
        "modalTitle"
    ).textContent =
        "Seu carrinho e orçamento";


    const body =
        document.getElementById(
            "modalBody"
        );


    if (!carrinho.length) {

        body.innerHTML = `
            <p>
                Seu carrinho está vazio.
            </p>

            <br>

            <button
                class="btn-primary"
                onclick="closeModal()"
            >
                Continuar comprando
            </button>
        `;

        document
            .getElementById("modal")
            .classList.add("open");

        return;
    }


    let total = 0;


    const lista =
        carrinho.map(item => {

            const produto =
                produtos.find(
                    p => p.id === item.id
                );

            if (!produto) return "";


            const subtotal =
                Number(produto.price) *
                item.quantidade;


            total += subtotal;


            return `
                <div class="cart-row">

                    <div>
                        <strong>
                            ${produto.name}
                        </strong>

                        <br>

                        <small>
                            ${formatarPreco(produto.price)}
                        </small>
                    </div>


                    <div class="quantity">

                        <button
                            onclick="alterarQuantidade(
                                ${produto.id},
                                -1
                            )"
                        >
                            −
                        </button>

                        <strong>
                            ${item.quantidade}
                        </strong>

                        <button
                            onclick="alterarQuantidade(
                                ${produto.id},
                                1
                            )"
                        >
                            +
                        </button>

                    </div>

                </div>
            `;

        }).join("");


    body.innerHTML = `

        <div class="cart-list">
            ${lista}
        </div>

        <div class="cart-total">
            Total estimado:
            ${formatarPreco(total)}
        </div>

        <p style="color:#64748b;font-size:13px;">
            Quer comprar as peças e solicitar
            instalação ou outro serviço?
            Preencha os dados abaixo.
        </p>


        <div class="field">

            <label>
                Seu nome
            </label>

            <input
                id="cn"
                placeholder="Digite seu nome"
            >

        </div>


        <div class="field">

            <label>
                Modelo do carro
            </label>

            <input
                id="cm"
                placeholder="Ex.: Chevrolet Onix 1.0"
            >

        </div>


        <div class="field">

            <label>
                Ano
            </label>

            <input
                id="cy"
                placeholder="Ex.: 2022"
            >

        </div>


        <div class="field">

            <label>
                Serviço / observação
            </label>

            <textarea
                id="cs"
                placeholder="Ex.: instalar as peças, troca de óleo, revisão..."
            ></textarea>

        </div>


        <button
            class="send-button"
            onclick="enviarOrcamentoCarrinho()"
        >
            Solicitar orçamento completo pelo WhatsApp →
        </button>

    `;


    document
        .getElementById("modal")
        .classList.add("open");
}


/* =========================================
   ALTERAR QUANTIDADE
========================================= */

function alterarQuantidade(id, quantidade) {

    const item =
        carrinho.find(
            item => item.id === id
        );


    const produto =
        produtos.find(
            produto => produto.id === id
        );


    if (!item || !produto) return;


    item.quantidade += quantidade;


    if (item.quantidade <= 0) {

        carrinho =
            carrinho.filter(
                item => item.id !== id
            );

    }


    if (
        item &&
        item.quantidade > produto.stock
    ) {

        item.quantidade =
            produto.stock;

    }


    atualizarCarrinho();

    openCart();
}


/* =========================================
   ORÇAMENTO DO CARRINHO + SERVIÇO
========================================= */

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


    if (!nome || !modelo || !ano) {

        alert(
            "Preencha nome, modelo do carro e ano."
        );

        return;
    }


    const itens =
        carrinho.map(item => {

            const produto =
                produtos.find(
                    produto =>
                        produto.id === item.id
                );


            return (
                "• " +
                produto.name +
                " — " +
                item.quantidade +
                " unidade(s)"
            );

        }).join("\n");


    let mensagem =
        "Olá! Gostaria de solicitar um orçamento completo.\n\n";


    mensagem +=
        "Nome: " +
        nome +
        "\n";


    mensagem +=
        "Veículo: " +
        modelo +
        "\n";


    mensagem +=
        "Ano: " +
        ano +
        "\n\n";


    mensagem +=
        "PEÇAS SELECIONADAS:\n";


    mensagem +=
        itens +
        "\n\n";


    mensagem +=
        "SERVIÇO / OBSERVAÇÃO:\n";


    mensagem +=
        (
            servico ||
            "Não informado"
        ) +
        "\n\n";


    mensagem +=
        "Gostaria de confirmar a disponibilidade, o valor das peças e, se necessário, o valor da instalação/serviço.";


    const url =
        "https://wa.me/" +
        WHATSAPP +
        "?text=" +
        encodeURIComponent(mensagem);


    window.open(
        url,
        "_blank"
    );
}


/* =========================================
   ORÇAMENTO SEM PRODUTOS
========================================= */

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
                id="nome"
                placeholder="Digite seu nome"
            >

        </div>


        <div class="field">

            <label>
                Modelo do carro
            </label>

            <input
                id="modelo"
                placeholder="Ex.: Chevrolet Onix 1.0"
            >

        </div>


        <div class="field">

            <label>
                Ano
            </label>

            <input
                id="ano"
                placeholder="Ex.: 2022"
            >

        </div>


        <div class="field">

            <label>
                O que você precisa?
            </label>

            <textarea
                id="solicitacao"
                placeholder="Ex.: troca de pastilhas, revisão, peça específica..."
            ></textarea>

        </div>


        <button
            class="send-button"
            onclick="enviarOrcamento()"
        >
            Enviar orçamento pelo WhatsApp →
        </button>

    `;


    document
        .getElementById("modal")
        .classList.add("open");
}


/* =========================================
   ENVIAR ORÇAMENTO
========================================= */

function enviarOrcamento() {

    const nome =
        document
            .getElementById("nome")
            .value
            .trim();


    const modelo =
        document
            .getElementById("modelo")
            .value
            .trim();


    const ano =
        document
            .getElementById("ano")
            .value
            .trim();


    const solicitacao =
        document
            .getElementById("solicitacao")
            .value
            .trim();


    if (
        !nome ||
        !modelo ||
        !ano ||
        !solicitacao
    ) {

        alert(
            "Preencha todos os campos."
        );

        return;
    }


    const mensagem =
        `Olá! Gostaria de solicitar um orçamento.

Nome: ${nome}
Veículo: ${modelo}
Ano: ${ano}

O que preciso:
${solicitacao}

Aguardo o orçamento. Obrigado!`;


    const url =
        "https://wa.me/" +
        WHATSAPP +
        "?text=" +
        encodeURIComponent(
            mensagem
        );


    window.open(
        url,
        "_blank"
    );
}


/* =========================================
   FECHAR MODAL
========================================= */

function closeModal() {

    document
        .getElementById("modal")
        .classList.remove("open");
}


/* =========================================
   AVISO
========================================= */

function mostrarAviso(texto) {

    const aviso =
        document.createElement("div");


    aviso.textContent =
        texto;


    aviso.style.position =
        "fixed";


    aviso.style.bottom =
        "20px";


    aviso.style.right =
        "20px";


    aviso.style.background =
        "#111827";


    aviso.style.color =
        "white";


    aviso.style.padding =
        "14px 18px";


    aviso.style.borderRadius =
        "10px";


    aviso.style.fontWeight =
        "bold";


    aviso.style.zIndex =
        "999";


    document.body.appendChild(
        aviso
    );


    setTimeout(() => {

        aviso.remove();

    }, 1800);
}


/* =========================================
   ADMIN — LOGIN
========================================= */

async function loginAdmin(
    email,
    senha
) {

    const { data, error } =
        await supabaseClient.auth
            .signInWithPassword({
                email: email,
                password: senha
            });


    if (error) {

        alert(
            "Erro ao entrar: " +
            error.message
        );

        return false;
    }


    usuarioAdmin =
        data.user;


    return true;
}


/* =========================================
   ADMIN — CADASTRAR PRODUTO
========================================= */

async function cadastrarProduto(
    nome,
    categoria,
    preco,
    estoque
) {

    const {
        data: userData
    } =
        await supabaseClient.auth
            .getUser();


    if (!userData.user) {

        alert(
            "Você precisa estar logado."
        );

        return;
    }


    const { error } =
        await supabaseClient
            .from("products")
            .insert({

                name: nome,

                category: categoria,

                price: Number(preco),

                stock: Number(estoque),

                active: true

            });


    if (error) {

        alert(
            "Erro ao cadastrar produto: " +
            error.message
        );

        return;
    }


    alert(
        "Produto cadastrado!"
    );


    carregarProdutos();
}


/* =========================================
   INICIAR
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        carregarProdutos();

        atualizarCarrinho();

    }
);