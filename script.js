/* =========================================================
   CONFIGURAÇÃO
========================================================= */

const SUPABASE_URL =
    "https://efnajcayxuxubpdljsqw.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_5_veDMZ8ni1WghmwSujh7Q_i8wwFEwK";

const WHATSAPP =
    "5541999141210";

const ADMIN_ID =
    "fe380b01-d59d-45c6-900c-cfd8cfd0234f";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


/* =========================================================
   PRODUTOS
========================================================= */

const produtosPadrao = [

    [
        "Pastilha de freio dianteira",
        "Freios",
        "R$ 129,90",
        "🛑",
        8
    ],

    [
        "Filtro de óleo",
        "Óleos e filtros",
        "R$ 39,90",
        "🛢️",
        12
    ],

    [
        "Amortecedor dianteiro",
        "Suspensão",
        "R$ 349,90",
        "⚙️",
        5
    ],

    [
        "Lâmpada automotiva",
        "Elétrica",
        "R$ 29,90",
        "💡",
        20
    ],

    [
        "Filtro de ar",
        "Óleos e filtros",
        "R$ 49,90",
        "🧰",
        9
    ],

    [
        "Disco de freio",
        "Freios",
        "R$ 219,90",
        "🔩",
        4
    ],

    [
        "Palheta do limpador",
        "Acessórios",
        "R$ 59,90",
        "🚘",
        7
    ],

    [
        "Vela de ignição",
        "Motor",
        "R$ 34,90",
        "🔧",
        15
    ]

];


let products =
    JSON.parse(
        localStorage.getItem("assis_products")
    ) || produtosPadrao;


let cart = [];


/* =========================================================
   PRODUTOS
========================================================= */

async function carregarProdutosSupabase() {

    const { data, error } =
        await supabaseClient
            .from("products")
            .select("*")
            .eq("active", true)
            .order("created_at", {
                ascending: false
            });


    if (error) {

        console.log(
            "Usando produtos locais:",
            error.message
        );

        render();

        return;
    }


    if (data && data.length > 0) {

        products = data.map(product => [

            product.name,

            product.category,

            formatarPreco(product.price),

            "🔧",

            product.stock,

            product.id

        ]);

    }


    render();
}


function formatarPreco(valor) {

    return Number(valor).toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );

}


/* =========================================================
   RENDERIZAÇÃO
========================================================= */

function render() {

    const container =
        document.getElementById("products");


    if (!container) return;


    container.innerHTML =
        products.map((product, index) => {

            return `

                <div class="product">

                    <div class="pic">
                        ${product[3]}
                    </div>

                    <div class="info">

                        <div class="tag">
                            ${product[1]}
                        </div>

                        <h3>
                            ${product[0]}
                        </h3>

                        <div class="price">
                            ${product[2]}
                        </div>

                        <button
                            class="add"
                            onclick="add(${index})"
                        >
                            Adicionar ao carrinho
                        </button>

                    </div>

                </div>

            `;

        }).join("");


    atualizarContador();

}


/* =========================================================
   CARRINHO
========================================================= */

function add(index) {

    const itemExistente =
        cart.find(
            item => item.index === index
        );


    if (itemExistente) {

        itemExistente.quantity++;

    } else {

        cart.push({

            index: index,

            quantity: 1

        });

    }


    atualizarContador();

    toast(
        "Produto adicionado ao carrinho"
    );

}


function atualizarContador() {

    const contador =
        document.getElementById("count");


    if (!contador) return;


    contador.textContent =
        cart.reduce(
            (total, item) =>
                total + item.quantity,
            0
        );

}


function change(index, difference) {

    cart[index].quantity += difference;


    if (
        cart[index].quantity <= 0
    ) {

        cart.splice(index, 1);

    }


    atualizarContador();

    openCart();

}


/* =========================================================
   CARRINHO / ORÇAMENTO
========================================================= */

function openCart() {

    const title =
        document.getElementById(
            "modalTitle"
        );

    const body =
        document.getElementById(
            "modalBody"
        );


    title.textContent =
        "Seu carrinho e orçamento";


    if (cart.length === 0) {

        body.innerHTML = `

            <p>
                Seu carrinho está vazio.
            </p>

            <button
                class="primary"
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


    let html = `

        <div class="cartlist">

    `;


    cart.forEach(
        (item, index) => {

            const product =
                products[item.index];


            html += `

                <div class="cartrow">

                    <div>

                        <b>
                            ${product[0]}
                        </b>

                        <br>

                        <small>
                            ${product[2]}
                        </small>

                    </div>

                    <div class="qty">

                        <button
                            onclick="change(${index}, -1)"
                        >
                            −
                        </button>

                        ${item.quantity}

                        <button
                            onclick="change(${index}, 1)"
                        >
                            +
                        </button>

                    </div>

                </div>

            `;

        }
    );


    html += `

        </div>

        <br>

        <p style="color:var(--muted);font-size:13px">

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
            class="send"
            onclick="cartBudgetWA()"
        >
            Solicitar orçamento completo pelo WhatsApp →
        </button>

    `;


    body.innerHTML = html;


    document
        .getElementById("modal")
        .classList.add("open");

}


function cartBudgetWA() {

    const name =
        document
            .getElementById("cn")
            .value
            .trim();


    const model =
        document
            .getElementById("cm")
            .value
            .trim();


    const year =
        document
            .getElementById("cy")
            .value
            .trim();


    const service =
        document
            .getElementById("cs")
            .value
            .trim();


    if (
        !name ||
        !model ||
        !year
    ) {

        alert(
            "Preencha nome, modelo do carro e ano."
        );

        return;
    }


    const items =
        cart.map(item => {

            const product =
                products[item.index];


            return (
                "• " +
                product[0] +
                " — " +
                item.quantity +
                " unidade(s)"
            );

        }).join("\n");


    const message =

`Olá! Gostaria de solicitar um orçamento completo.

Nome: ${name}

Veículo: ${model}

Ano: ${year}

Peças selecionadas:

${items}

Serviço/observação:
${service || "Não informado"}

Gostaria de confirmar a disponibilidade, o valor das peças e, se necessário, o valor da instalação/serviço.`;


    const url =
        "https://wa.me/" +
        WHATSAPP +
        "?text=" +
        encodeURIComponent(message);


    window.open(
        url,
        "_blank"
    );

}


/* =========================================================
   ORÇAMENTO SEM CARRINHO
========================================================= */

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
                placeholder="Digite seu nome"
            >

        </div>


        <div class="field">

            <label>
                Modelo do carro
            </label>

            <input
                id="m"
                placeholder="Ex.: Chevrolet Onix 1.0"
            >

        </div>


        <div class="field">

            <label>
                Ano
            </label>

            <input
                id="y"
                placeholder="Ex.: 2022"
            >

        </div>


        <div class="field">

            <label>
                O que você precisa?
            </label>

            <textarea
                id="s"
                placeholder="Ex.: Troca de pastilhas de freio, revisão, peça específica..."
            ></textarea>

        </div>


        <button
            class="send"
            onclick="budgetWA()"
        >
            Enviar orçamento pelo WhatsApp →
        </button>

    `;


    document
        .getElementById("modal")
        .classList.add("open");

}


function budgetWA() {

    const name =
        document
            .getElementById("n")
            .value
            .trim();


    const model =
        document
            .getElementById("m")
            .value
            .trim();


    const year =
        document
            .getElementById("y")
            .value
            .trim();


    const request =
        document
            .getElementById("s")
            .value
            .trim();


    if (
        !name ||
        !model ||
        !year ||
        !request
    ) {

        alert(
            "Preencha todos os campos para continuar."
        );

        return;
    }


    const message =

`Olá! Gostaria de solicitar um orçamento.

Nome: ${name}

Veículo: ${model}

Ano: ${year}

Solicitação:
${request}

Aguardo o orçamento. Obrigado!`;


    const url =
        "https://wa.me/" +
        WHATSAPP +
        "?text=" +
        encodeURIComponent(message);


    window.open(
        url,
        "_blank"
    );

}


/* =========================================================
   MODAL
========================================================= */

function closeModal() {

    document
        .getElementById("modal")
        .classList.remove("open");

}


/* =========================================================
   AVISO
========================================================= */

function toast(message) {

    const element =
        document.createElement("div");


    element.textContent =
        message;


    element.style = `

        position:fixed;

        bottom:22px;

        right:22px;

        background:#111827;

        color:#fff;

        padding:13px 17px;

        border-radius:10px;

        z-index:50;

        font-weight:800;

    `;


    document.body.appendChild(
        element
    );


    setTimeout(
        () => element.remove(),
        1600
    );

}


/* =========================================================
   ADMINISTRAÇÃO
========================================================= */

async function openAdmin() {

    const {
        data,
        error
    } =
        await supabaseClient
            .auth
            .getUser();


    if (
        !error &&
        data.user &&
        data.user.id === ADMIN_ID
    ) {

        openAdminPanel();

        return;

    }


    document.getElementById(
        "modalTitle"
    ).textContent =
        "Login administrativo";


    document.getElementById(
        "modalBody"
    ).innerHTML = `

        <p style="color:var(--muted)">

            Entre com o e-mail e a senha
            do administrador.

        </p>


        <div class="field">

            <label>
                E-mail
            </label>

            <input
                id="adminEmail"
                type="email"
                placeholder="Seu e-mail"
            >

        </div>


        <div class="field">

            <label>
                Senha
            </label>

            <input
                id="adminPassword"
                type="password"
                placeholder="Sua senha"
            >

        </div>


        <button
            class="primary"
            style="width:100%"
            onclick="adminLogin()"
        >
            Entrar no painel
        </button>

    `;


    document
        .getElementById("modal")
        .classList.add("open");

}


/* =========================================================
   LOGIN
========================================================= */

async function adminLogin() {

    const email =
        document
            .getElementById("adminEmail")
            .value
            .trim();


    const password =
        document
            .getElementById("adminPassword")
            .value;


    if (!email || !password) {

        alert(
            "Informe e-mail e senha."
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

                email: email,

                password: password

            });


    if (error) {

        alert(
            "E-mail ou senha incorretos."
        );

        return;

    }


    if (
        !data.user ||
        data.user.id !== ADMIN_ID
    ) {

        await supabaseClient
            .auth
            .signOut();


        alert(
            "Este usuário não tem acesso administrativo."
        );

        return;

    }


    openAdminPanel();

}


/* =========================================================
   PAINEL ADMIN
========================================================= */

function openAdminPanel() {

    document.getElementById(
        "modalTitle"
    ).textContent =
        "Painel administrativo";


    document.getElementById(
        "modalBody"
    ).innerHTML = `

        <p style="color:var(--muted)">

            Gerencie produtos, preços e estoque.

        </p>


        <div class="field">

            <label>
                Novo produto
            </label>

            <input
                id="productName"
                placeholder="Nome do produto"
            >

        </div>


        <div class="field">

            <label>
                Categoria
            </label>

            <input
                id="productCategory"
                placeholder="Ex.: Freios"
            >

        </div>


        <div class="field">

            <label>
                Preço
            </label>

            <input
                id="productPrice"
                placeholder="Ex.: 149,90"
            >

        </div>


        <div class="field">

            <label>
                Estoque inicial
            </label>

            <input
                id="productStock"
                type="number"
                min="0"
                value="1"
            >

        </div>


        <button
            class="primary"
            style="width:100%;margin-bottom:10px"
            onclick="adminAdd()"
        >
            Cadastrar produto
        </button>


        <button
            class="close"
            style="width:100%;margin-bottom:18px"
            onclick="adminLogout()"
        >
            Sair do painel
        </button>


        <div id="adminList"></div>

    `;


    document
        .getElementById("modal")
        .classList.add("open");


    renderAdmin();

}


/* =========================================================
   CADASTRAR PRODUTO
========================================================= */

async function adminAdd() {

    const name =
        document
            .getElementById("productName")
            .value
            .trim();


    const category =
        document
            .getElementById("productCategory")
            .value
            .trim();


    const priceText =
        document
            .getElementById("productPrice")
            .value
            .trim()
            .replace(",", ".");


    const stock =
        Number(
            document
                .getElementById("productStock")
                .value
        );


    const price =
        Number(priceText);


    if (
        !name ||
        !category ||
        !price ||
        price < 0 ||
        stock < 0
    ) {

        alert(
            "Preencha nome, categoria, preço e estoque corretamente."
        );

        return;

    }


    const {
        error
    } =
        await supabaseClient
            .from("products")
            .insert({

                name: name,

                category: category,

                price: price,

                stock: stock,

                active: true

            });


    if (error) {

        console.error(error);

        alert(
            "Não foi possível cadastrar o produto."
        );

        return;

    }


    alert(
        "Produto cadastrado com sucesso!"
    );


    await carregarProdutosSupabase();

    openAdminPanel();

}


/* =========================================================
   ESTOQUE
========================================================= */

async function alterarEstoque(
    id,
    atual,
    diferenca
) {

    const novoEstoque =
        Math.max(
            0,
            Number(atual) + diferenca
        );


    const {
        error
    } =
        await supabaseClient
            .from("products")
            .update({
                stock: novoEstoque
            })
            .eq("id", id);


    if (error) {

        console.error(error);

        alert(
            "Não foi possível alterar o estoque."
        );

        return;

    }


    /*
       Atualiza somente o produto alterado.
       Não reconstrói o painel inteiro.
    */

    const produto =
        products.find(
            product => String(product[5]) === String(id)
        );


    if (produto) {

        produto[4] =
            novoEstoque;

    }


    const elementoEstoque =
        document.querySelector(
            `[data-estoque-id="${id}"]`
        );


    if (elementoEstoque) {

        elementoEstoque.textContent =
            `Estoque: ${novoEstoque}`;

    }

}


/* =========================================================
   EXCLUIR PRODUTO
========================================================= */

async function adminRemove(id) {

    const confirmar =
        confirm(
            "Tem certeza que deseja excluir este produto?"
        );


    if (!confirmar) return;


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


    await carregarProdutosSupabase();

    openAdminPanel();

}


/* =========================================================
   LISTA ADMINISTRATIVA
========================================================= */

function renderAdmin() {

    const container =
        document.getElementById(
            "adminList"
        );


    if (!container) return;


    container.innerHTML =
        "<h3>Produtos cadastrados</h3>" +
        products.map(
            product => {

                const id =
                    product[5];

                const stock =
                    product[4] || 0;


                if (!id) {

                    return `
                        <div
                            style="
                                border:1px solid var(--line);
                                padding:12px;
                                border-radius:12px;
                                margin:9px 0
                            "
                        >

                            <b>
                                ${product[0]}
                            </b>

                            <br>

                            <small>
                                ${product[1]}
                                ·
                                ${product[2]}
                            </small>

                            <div
                                style="
                                    margin-top:8px;
                                    color:var(--muted)
                                "
                            >
                                Produto local do protótipo
                            </div>

                        </div>
                    `;

                }


                return `

                    <div
                        style="
                            border:1px solid var(--line);
                            padding:12px;
                            border-radius:12px;
                            margin:9px 0
                        "
                    >

                        <b>
                            ${product[0]}
                        </b>

                        <br>

                        <small>
                            ${product[1]}
                            ·
                            ${product[2]}
                        </small>


                        <div
                            style="
                                display:flex;
                                gap:7px;
                                align-items:center;
                                margin-top:9px
                            "
                        >

                            <button
                                class="close"
                                onclick="alterarEstoque(
                                    '${id}',
                                    ${stock},
                                    -1
                                )"
                            >
                                −
                            </button>


                            <b
                                data-estoque-id="${id}"
                            >
                                Estoque: ${stock}
                            </b>


                            <button
                                class="close"
                                onclick="alterarEstoque(
                                    '${id}',
                                    ${stock},
                                    1
                                )"
                            >
                                +
                            </button>


                            <button
                                class="close"
                                style="margin-left:auto"
                                onclick="adminRemove('${id}')"
                            >
                                Excluir
                            </button>

                        </div>

                    </div>

                `;

            }
        ).join("");

}


/* =========================================================
   LOGOUT
========================================================= */

async function adminLogout() {

    await supabaseClient
        .auth
        .signOut();


    closeModal();


    toast(
        "Sessão encerrada"
    );

}


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

carregarProdutosSupabase();