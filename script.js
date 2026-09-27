/* =====================================================
   CONFIGURAÇÕES
===================================================== */


/*
    COLE AQUI A PROJECT URL DO SUPABASE
*/
const SUPABASE_URL = "https://efnajcayxuxubpdljsqw.supabase.co";


/*
    COLE AQUI A PUBLISHABLE KEY DO SUPABASE

    NÃO coloque a Secret Key.
*/
const SUPABASE_KEY = "sb_publishable_5_veDMZ8ni1WghmwSujh7Q_i8wwFEwK";


/*
    WhatsApp da Assis Autopeças
*/
const WHATSAPP = "5541999141210";


/*
    Inicializa o Supabase
*/
const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


/* =====================================================
   VARIÁVEIS
===================================================== */

let produtos = [];

let carrinho = [];

let usuarioAdmin = null;


/* =====================================================
   ÍCONES POR CATEGORIA
===================================================== */

function getIconeCategoria(categoria) {

    const cat = String(categoria).toLowerCase();


    if (cat.includes("freio")) {
        return "🛑";
    }


    if (cat.includes("suspens")) {
        return "⚙️";
    }


    if (
        cat.includes("óleo") ||
        cat.includes("oleo") ||
        cat.includes("filtro")
    ) {
        return "🛢️";
    }


    if (cat.includes("elétr") || cat.includes("eletr")) {
        return "💡";
    }


    if (cat.includes("motor")) {
        return "🔧";
    }


    if (cat.includes("acess")) {
        return "🚘";
    }


    return "🔩";
}


/* =====================================================
   FORMATA PREÇO
===================================================== */

function formatarPreco(valor) {

    return Number(valor).toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );

}


/* =====================================================
   CARREGAR PRODUTOS DO SUPABASE
===================================================== */

async function carregarProdutos() {

    const container =
        document.getElementById("products");


    container.innerHTML = `
        <p>Carregando produtos...</p>
    `;


    const {
        data,
        error
    } = await supabaseClient
        .from("products")
        .select("*")
        .eq("active", true)
        .order("created_at", {
            ascending: false
        });


    if (error) {

        console.error(
            "Erro ao carregar produtos:",
            error
        );


        container.innerHTML = `
            <p>
                Não foi possível carregar os produtos.
                Tente novamente.
            </p>
        `;

        return;
    }


    produtos = data || [];


    renderProdutos();

}


/* =====================================================
   MOSTRAR PRODUTOS
===================================================== */

function renderProdutos() {

    const container =
        document.getElementById("products");


    if (!produtos.length) {

        container.innerHTML = `
            <p>
                Nenhum produto disponível no momento.
            </p>
        `;

        atualizarContadorCarrinho();

        return;
    }


    container.innerHTML =
        produtos.map((produto) => {

            const estoque =
                Number(produto.stock || 0);


            const indisponivel =
                estoque <= 0;


            return `

                <div class="product-card">

                    <div class="product-image">

                        ${
                            produto.image_url ||
                            getIconeCategoria(
                                produto.category
                            )
                        }

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


                        <div class="product-stock">

                            ${
                                indisponivel
                                    ? "Produto indisponível"
                                    : `${estoque} unidade(s) disponível(is)`
                            }

                        </div>


                        <button
                            class="add-button"
                            onclick="adicionarCarrinho('${produto.id}')"
                            ${indisponivel ? "disabled" : ""}
                        >

                            ${
                                indisponivel
                                    ? "Sem estoque"
                                    : "Adicionar ao carrinho"
                            }

                        </button>

                    </div>

                </div>

            `;

        }).join("");


    atualizarContadorCarrinho();

}


/* =====================================================
   ADICIONAR AO CARRINHO
===================================================== */

function adicionarCarrinho(id) {

    const produto =
        produtos.find(
            p => String(p.id) === String(id)
        );


    if (!produto) {
        return;
    }


    const estoque =
        Number(produto.stock || 0);


    if (estoque <= 0) {

        alert(
            "Este produto está sem estoque."
        );

        return;
    }


    const item =
        carrinho.find(
            item =>
                String(item.id) === String(id)
        );


    if (item) {

        if (item.quantidade >= estoque) {

            alert(
                "Você atingiu o limite disponível em estoque."
            );

            return;
        }


        item.quantidade++;

    } else {

        carrinho.push({

            id: produto.id,

            quantidade: 1

        });

    }


    atualizarContadorCarrinho();


    mostrarToast(
        "Produto adicionado ao carrinho"
    );

}


/* =====================================================
   CONTADOR DO CARRINHO
===================================================== */

function atualizarContadorCarrinho() {

    const contador =
        document.getElementById("cartCount");


    const quantidade =
        carrinho.reduce(
            (total, item) =>
                total + item.quantidade,
            0
        );


    contador.textContent =
        quantidade;

}


/* =====================================================
   ABRIR CARRINHO
===================================================== */

function openCart() {

    document.getElementById(
        "modalTitle"
    ).textContent =
        "Seu carrinho";


    const body =
        document.getElementById(
            "modalBody"
        );


    if (!carrinho.length) {

        body.innerHTML = `

            <p>
                Seu carrinho está vazio.
            </p>


            <button
                class="btn-primary"
                onclick="closeModal()"
            >

                Continuar comprando

            </button>

        `;


        abrirModal();

        return;
    }


    let total = 0;


    const produtosCarrinho =
        carrinho.map(
            item => {

                const produto =
                    produtos.find(
                        p =>
                            String(p.id) ===
                            String(item.id)
                    );


                if (!produto) {
                    return "";
                }


                const subtotal =
                    Number(produto.price) *
                    item.quantidade;


                total += subtotal;


                return `

                    <div class="cart-row">

                        <div>

                            <div class="cart-product-name">

                                ${produto.name}

                            </div>

                            <div class="cart-product-price">

                                ${formatarPreco(produto.price)}

                            </div>

                        </div>


                        <div class="quantity">

                            <button
                                onclick="alterarQuantidade('${produto.id}', -1)"
                            >
                                −
                            </button>


                            <strong>
                                ${item.quantidade}
                            </strong>


                            <button
                                onclick="alterarQuantidade('${produto.id}', 1)"
                            >
                                +
                            </button>

                        </div>

                    </div>

                `;

            }
        ).join("");


    body.innerHTML = `

        <div class="cart-list">

            ${produtosCarrinho}

        </div>


        <div class="cart-total">

            <span>Total</span>

            <span>
                ${formatarPreco(total)}
            </span>

        </div>


        <br>


        <button
            class="send-button"
            onclick="finalizarCarrinhoWhatsApp()"
        >

            Finalizar pelo WhatsApp

        </button>

    `;


    abrirModal();

}


/* =====================================================
   ALTERAR QUANTIDADE
===================================================== */

function alterarQuantidade(
    id,
    alteracao
) {

    const item =
        carrinho.find(
            item =>
                String(item.id) ===
                String(id)
        );


    const produto =
        produtos.find(
            p =>
                String(p.id) ===
                String(id)
        );


    if (!item || !produto) {
        return;
    }


    item.quantidade +=
        alteracao;


    if (
        item.quantidade >
        Number(produto.stock)
    ) {

        item.quantidade =
            Number(produto.stock);

    }


    if (item.quantidade <= 0) {

        carrinho =
            carrinho.filter(
                item =>
                    String(item.id) !==
                    String(id)
            );

    }


    atualizarContadorCarrinho();

    openCart();

}


/* =====================================================
   FINALIZAR CARRINHO NO WHATSAPP
===================================================== */

function finalizarCarrinhoWhatsApp() {

    if (!carrinho.length) {
        return;
    }


    let mensagem =
        "Olá! Gostaria de solicitar um orçamento/compra das seguintes peças:\n\n";


    let total = 0;


    carrinho.forEach(item => {

        const produto =
            produtos.find(
                p =>
                    String(p.id) ===
                    String(item.id)
            );


        if (!produto) {
            return;
        }


        const subtotal =
            Number(produto.price) *
            item.quantidade;


        total += subtotal;


        mensagem +=
            `• ${produto.name} — ${item.quantidade} unidade(s) — ${formatarPreco(subtotal)}\n`;

    });


    mensagem +=
        `\nTotal estimado: ${formatarPreco(total)}`;


    mensagem +=
        "\n\nGostaria de confirmar disponibilidade e valor.";


    const url =
        `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(mensagem)}`;


    window.open(
        url,
        "_blank"
    );

}


/* =====================================================
   ORÇAMENTO
===================================================== */

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
                id="budgetName"
                placeholder="Digite seu nome"
            >

        </div>


        <div class="field">

            <label>
                Modelo do carro
            </label>

            <input
                id="budgetCar"
                placeholder="Ex.: Chevrolet Onix 1.0"
            >

        </div>


        <div class="field">

            <label>
                Ano
            </label>

            <input
                id="budgetYear"
                placeholder="Ex.: 2022"
            >

        </div>


        <div class="field">

            <label>
                O que você precisa?
            </label>

            <textarea
                id="budgetRequest"
                placeholder="Ex.: Troca de pastilhas de freio, revisão, peça específica..."
            ></textarea>

        </div>


        <button
            class="send-button"
            onclick="enviarOrcamentoWhatsApp()"
        >

            Enviar orçamento pelo WhatsApp →

        </button>

    `;


    abrirModal();

}


/* =====================================================
   ENVIAR ORÇAMENTO
===================================================== */

function enviarOrcamentoWhatsApp() {

    const nome =
        document
            .getElementById("budgetName")
            .value
            .trim();


    const carro =
        document
            .getElementById("budgetCar")
            .value
            .trim();


    const ano =
        document
            .getElementById("budgetYear")
            .value
            .trim();


    const pedido =
        document
            .getElementById("budgetRequest")
            .value
            .trim();


    if (
        !nome ||
        !carro ||
        !ano ||
        !pedido
    ) {

        alert(
            "Preencha todos os campos para continuar."
        );

        return;
    }


    const mensagem =

        `Olá! Gostaria de solicitar um orçamento.\n\n` +

        `Nome: ${nome}\n` +

        `Veículo: ${carro}\n` +

        `Ano: ${ano}\n` +

        `Solicitação: ${pedido}\n\n` +

        `Aguardo o orçamento. Obrigado!`;


    const url =
        `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(mensagem)}`;


    window.open(
        url,
        "_blank"
    );

}


/* =====================================================
   ADMIN
===================================================== */

async function openAdmin() {

    const {
        data
    } =
        await supabaseClient
            .auth
            .getUser();


    usuarioAdmin =
        data.user;


    if (!usuarioAdmin) {

        mostrarLoginAdmin();

        return;
    }


    mostrarPainelAdmin();

}


/* =====================================================
   LOGIN ADMIN
===================================================== */

function mostrarLoginAdmin() {

    document.getElementById(
        "modalTitle"
    ).textContent =
        "Área administrativa";


    document.getElementById(
        "modalBody"
    ).innerHTML = `

        <p>
            Entre com sua conta administrativa
            para gerenciar os produtos.
        </p>


        <div class="field">

            <label>
                E-mail
            </label>

            <input
                type="email"
                id="adminEmail"
                placeholder="Seu e-mail"
            >

        </div>


        <div class="field">

            <label>
                Senha
            </label>

            <input
                type="password"
                id="adminPassword"
                placeholder="Sua senha"
            >

        </div>


        <button
            class="btn-primary"
            style="width:100%"
            onclick="loginAdmin()"
        >

            Entrar

        </button>

    `;


    abrirModal();

}


/* =====================================================
   FAZER LOGIN
===================================================== */

async function loginAdmin() {

    const email =
        document
            .getElementById(
                "adminEmail"
            )
            .value
            .trim();


    const password =
        document
            .getElementById(
                "adminPassword"
            )
            .value;


    if (!email || !password) {

        alert(
            "Digite seu e-mail e sua senha."
        );

        return;
    }


    const {
        data,
        error
    } =
        await supabaseClient
            .auth
            .signInWithPassword({

                email,

                password

            });


    if (error) {

        console.error(error);


        alert(
            "E-mail ou senha incorretos."
        );

        return;
    }


    usuarioAdmin =
        data.user;


    mostrarToast(
        "Login realizado com sucesso"
    );


    mostrarPainelAdmin();

}


/* =====================================================
   PAINEL ADMIN
===================================================== */

async function mostrarPainelAdmin() {

    document.getElementById(
        "modalTitle"
    ).textContent =
        "Painel administrativo";


    document.getElementById(
        "modalBody"
    ).innerHTML = `

        <p>
            Cadastre produtos, controle preços
            e gerencie o estoque.
        </p>


        <hr>


        <h3>
            Novo produto
        </h3>


        <div class="field">

            <label>
                Nome do produto
            </label>

            <input
                id="adminName"
                placeholder="Ex.: Pastilha de freio"
            >

        </div>


        <div class="field">

            <label>
                Categoria
            </label>

            <input
                id="adminCategory"
                placeholder="Ex.: Freios"
            >

        </div>


        <div class="field">

            <label>
                Preço
            </label>

            <input
                id="adminPrice"
                type="number"
                step="0.01"
                min="0"
                placeholder="Ex.: 129.90"
            >

        </div>


        <div class="field">

            <label>
                Estoque inicial
            </label>

            <input
                id="adminStock"
                type="number"
                min="0"
                value="1"
            >

        </div>


        <div class="field">

            <label>
                Descrição
            </label>

            <textarea
                id="adminDescription"
                placeholder="Descrição do produto"
            ></textarea>

        </div>


        <button
            class="btn-primary"
            style="width:100%"
            onclick="cadastrarProduto()"
        >

            Cadastrar produto

        </button>


        <br><br>


        <h3>
            Produtos cadastrados
        </h3>


        <div id="adminProducts">
            Carregando...
        </div>


        <button
            class="admin-logout"
            onclick="logoutAdmin()"
        >

            Sair da conta

        </button>

    `;


    abrirModal();


    await carregarProdutosAdmin();

}


/* =====================================================
   CARREGAR PRODUTOS NO ADMIN
===================================================== */

async function carregarProdutosAdmin() {

    const container =
        document.getElementById(
            "adminProducts"
        );


    const {
        data,
        error
    } =
        await supabaseClient
            .from("products")
            .select("*")
            .order("created_at", {
                ascending: false
            });


    if (error) {

        console.error(error);


        container.innerHTML =
            "<p>Erro ao carregar produtos.</p>";

        return;
    }


    if (!data.length) {

        container.innerHTML =
            "<p>Nenhum produto cadastrado.</p>";

        return;
    }


    container.innerHTML =
        data.map(
            produto => `

                <div class="admin-product">

                    <div class="admin-product-header">

                        <div>

                            <strong>
                                ${produto.name}
                            </strong>

                            <br>

                            <small>
                                ${produto.category}
                                ·
                                ${formatarPreco(produto.price)}
                            </small>

                        </div>

                    </div>


                    <div class="admin-actions">

                        <button
                            class="admin-small-button"
                            onclick="alterarEstoque('${produto.id}', -1)"
                        >
                            −
                        </button>


                        <strong>
                            Estoque:
                            ${produto.stock || 0}
                        </strong>


                        <button
                            class="admin-small-button"
                            onclick="alterarEstoque('${produto.id}', 1)"
                        >
                            +
                        </button>


                        <button
                            class="admin-small-button admin-delete"
                            onclick="excluirProduto('${produto.id}')"
                        >

                            Excluir

                        </button>

                    </div>

                </div>

            `
        ).join("");

}


/* =====================================================
   CADASTRAR PRODUTO
===================================================== */

async function cadastrarProduto() {

    const nome =
        document
            .getElementById("adminName")
            .value
            .trim();


    const categoria =
        document
            .getElementById("adminCategory")
            .value
            .trim();


    const preco =
        Number(
            document
                .getElementById("adminPrice")
                .value
        );


    const estoque =
        Number(
            document
                .getElementById("adminStock")
                .value
        );


    const descricao =
        document
            .getElementById(
                "adminDescription"
            )
            .value
            .trim();


    if (
        !nome ||
        !categoria ||
        !preco ||
        preco < 0 ||
        estoque < 0
    ) {

        alert(
            "Preencha nome, categoria, preço e estoque."
        );

        return;
    }


    const {
        error
    } =
        await supabaseClient
            .from("products")
            .insert({

                name: nome,

                category: categoria,

                price: preco,

                stock: estoque,

                description:
                    descricao,

                image_url: null,

                active: true

            });


    if (error) {

        console.error(error);


        alert(
            "Não foi possível cadastrar o produto."
        );

        return;
    }


    mostrarToast(
        "Produto cadastrado"
    );


    await carregarProdutos();

    await carregarProdutosAdmin();


    document
        .getElementById("adminName")
        .value = "";


    document
        .getElementById("adminCategory")
        .value = "";


    document
        .getElementById("adminPrice")
        .value = "";


    document
        .getElementById("adminStock")
        .value = "1";


    document
        .getElementById("adminDescription")
        .value = "";

}


/* =====================================================
   ALTERAR ESTOQUE
===================================================== */

async function alterarEstoque(
    id,
    alteracao
) {

    const {
        data: produto,
        error: erroBusca
    } =
        await supabaseClient
            .from("products")
            .select("stock")
            .eq("id", id)
            .single();


    if (erroBusca) {

        console.error(erroBusca);

        alert(
            "Erro ao encontrar o produto."
        );

        return;
    }


    const novoEstoque =
        Math.max(
            0,
            Number(produto.stock || 0) +
            alteracao
        );


    const {
        error
    } =
        await supabaseClient
            .from("products")
            .update({

                stock:
                    novoEstoque

            })
            .eq("id", id);


    if (error) {

        console.error(error);

        alert(
            "Não foi possível atualizar o estoque."
        );

        return;
    }


    await carregarProdutos();

    await carregarProdutosAdmin();


    mostrarToast(
        "Estoque atualizado"
    );

}


/* =====================================================
   EXCLUIR PRODUTO
===================================================== */

async function excluirProduto(id) {

    const confirmar =
        confirm(
            "Tem certeza que deseja excluir este produto?"
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
            .eq("id", id);


    if (error) {

        console.error(error);

        alert(
            "Não foi possível excluir o produto."
        );

        return;
    }


    await carregarProdutos();

    await carregarProdutosAdmin();


    mostrarToast(
        "Produto excluído"
    );

}


/* =====================================================
   LOGOUT
===================================================== */

async function logoutAdmin() {

    await supabaseClient
        .auth
        .signOut();


    usuarioAdmin = null;


    closeModal();


    mostrarToast(
        "Você saiu da conta"
    );

}


/* =====================================================
   MODAL
===================================================== */

function abrirModal() {

    document
        .getElementById("modal")
        .classList
        .add("open");

}


function closeModal() {

    document
        .getElementById("modal")
        .classList
        .remove("open");

}


/* =====================================================
   TOAST
===================================================== */

function mostrarToast(texto) {

    const toast =
        document.createElement("div");


    toast.className =
        "toast";


    toast.textContent =
        texto;


    document.body.appendChild(
        toast
    );


    setTimeout(
        () => {
            toast.remove();
        },
        1800
    );

}


/* =====================================================
   INICIALIZAÇÃO
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        carregarProdutos();

    }
);