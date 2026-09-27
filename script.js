const SUPABASE_URL =
    'https://efnajcayxuxubpdljsqw.supabase.co';

const SUPABASE_KEY =
    'sb_publishable_5_veDMZ8ni1WghmwSujh7Q_i8wwFEwK';

const WHATSAPP = '5541999141210';

const ADMIN_ID =
    'fe380b01-d59d-45c6-900c-cfd8cfd0234f';

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );

let products = [];
let cart = [];


/* =========================================================
   FORMATAÇÃO
========================================================= */

function formatarPreco(valor) {
    return Number(valor || 0).toLocaleString(
        'pt-BR',
        {
            style: 'currency',
            currency: 'BRL'
        }
    );
}


/* =========================================================
   RENDER DOS PRODUTOS
========================================================= */

function render() {

    const el = document.getElementById('products');

    if (el) {

        if (!products.length) {

            el.innerHTML = `
                <p style="color:var(--muted)">
                    Nenhum produto disponível no momento.
                </p>
            `;

        } else {

            el.innerHTML = products.map((p, i) => {

                const estoque = Number(p[4]) || 0;

                return `
                    <div class="product">

                        <div class="pic">
                            ${p[3] || '🔧'}
                        </div>

                        <div class="info">

                            <div class="tag">
                                ${p[1]}
                            </div>

                            <h3>
                                ${p[0]}
                            </h3>

                            <div class="price">
                                ${p[2]}
                            </div>

                            <button
                                class="add"
                                onclick="add(${i})"
                                ${estoque <= 0 ? 'disabled' : ''}
                            >
                                ${
                                    estoque <= 0
                                        ? 'Sem estoque'
                                        : 'Adicionar ao carrinho'
                                }
                            </button>

                        </div>

                    </div>
                `;

            }).join('');

        }
    }

    const count =
        document.getElementById('count');

    if (count) {

        count.textContent =
            cart.reduce(
                (total, item) => total + item.q,
                0
            );

    }
}


/* =========================================================
   ADICIONAR AO CARRINHO
========================================================= */

function add(index) {

    const produto = products[index];

    if (!produto) return;

    const estoque =
        Number(produto[4]) || 0;

    if (estoque <= 0) {

        toast('Produto sem estoque');

        return;
    }

    const item =
        cart.find(
            item => item.i === index
        );

    if (item) {

        if (item.q >= estoque) {

            toast(
                'Limite de estoque atingido'
            );

            return;
        }

        item.q++;

    } else {

        cart.push({
            i: index,
            q: 1
        });

    }

    render();

    toast(
        'Produto adicionado ao carrinho'
    );
}


/* =========================================================
   ALTERAR QUANTIDADE
========================================================= */

function change(index, difference) {

    const item = cart[index];

    if (!item) return;

    const produto =
        products[item.i];

    if (!produto) {

        cart.splice(index, 1);

        render();

        openCart();

        return;
    }

    const estoque =
        Number(produto[4]) || 0;

    if (
        difference > 0 &&
        item.q + difference > estoque
    ) {

        toast(
            'Limite de estoque atingido'
        );

        return;
    }

    item.q += difference;

    if (item.q <= 0) {

        cart.splice(index, 1);

    }

    render();

    openCart();
}


/* =========================================================
   CARRINHO
========================================================= */

function openCart() {

    document.getElementById(
        'modalTitle'
    ).textContent =
        'Seu carrinho e orçamento';

    const body =
        document.getElementById(
            'modalBody'
        );

    if (!cart.length) {

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
            .getElementById('modal')
            .classList.add('open');

        return;
    }

    body.innerHTML = `
        <div class="cartlist">

            ${
                cart.map((item, index) => {

                    const produto =
                        products[item.i];

                    return `
                        <div class="cartrow">

                            <div>

                                <b>
                                    ${produto[0]}
                                </b>

                                <br>

                                <small>
                                    ${produto[2]}
                                </small>

                            </div>

                            <div class="qty">

                                <button
                                    onclick="change(${index}, -1)"
                                >
                                    −
                                </button>

                                ${item.q}

                                <button
                                    onclick="change(${index}, 1)"
                                >
                                    +
                                </button>

                            </div>

                        </div>
                    `;

                }).join('')
            }

        </div>

        <br>

        <p
            style="
                color:var(--muted);
                font-size:13px
            "
        >
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

    document
        .getElementById('modal')
        .classList.add('open');
}


/* =========================================================
   ORÇAMENTO DO CARRINHO
========================================================= */

function cartBudgetWA() {

    const nome =
        document.getElementById('cn')
            ?.value.trim() || '';

    const modelo =
        document.getElementById('cm')
            ?.value.trim() || '';

    const ano =
        document.getElementById('cy')
            ?.value.trim() || '';

    const servico =
        document.getElementById('cs')
            ?.value.trim() || '';

    if (!nome || !modelo || !ano) {

        alert(
            'Preencha nome, modelo do carro e ano.'
        );

        return;
    }

    const itens =
        cart.map(item => {

            const produto =
                products[item.i];

            return (
                '• ' +
                produto[0] +
                ' — ' +
                item.q +
                ' unidade(s)'
            );

        }).join('\n');

    const mensagem =
        `Olá! Gostaria de solicitar um orçamento completo.

Nome: ${nome}
Veículo: ${modelo}
Ano: ${ano}

Peças selecionadas:
${itens}

Serviço/observação:
${servico || 'Não informado'}

Gostaria de confirmar disponibilidade, valor das peças e, se necessário, valor da instalação/serviço.`;

    window.open(
        'https://wa.me/' +
        WHATSAPP +
        '?text=' +
        encodeURIComponent(mensagem),
        '_blank'
    );
}


/* =========================================================
   ORÇAMENTO SEM CARRINHO
========================================================= */

function openBudget() {

    document.getElementById(
        'modalTitle'
    ).textContent =
        'Solicitar orçamento';

    document.getElementById(
        'modalBody'
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
        .getElementById('modal')
        .classList.add('open');
}


function budgetWA() {

    const nome =
        document.getElementById('n')
            .value.trim();

    const modelo =
        document.getElementById('m')
            .value.trim();

    const ano =
        document.getElementById('y')
            .value.trim();

    const solicitacao =
        document.getElementById('s')
            .value.trim();

    if (
        !nome ||
        !modelo ||
        !ano ||
        !solicitacao
    ) {

        alert(
            'Preencha todos os campos para continuar.'
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
        'https://wa.me/' +
        WHATSAPP +
        '?text=' +
        encodeURIComponent(mensagem),
        '_blank'
    );
}


/* =========================================================
   MODAL
========================================================= */

function closeModal() {

    document
        .getElementById('modal')
        .classList.remove('open');
}


/* =========================================================
   NOTIFICAÇÃO
========================================================= */

function toast(texto) {

    const elemento =
        document.createElement('div');

    elemento.textContent = texto;

    elemento.style = `
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

    document.body.appendChild(elemento);

    setTimeout(
        () => elemento.remove(),
        1600
    );
}


/* =========================================================
   LOGIN ADMINISTRATIVO
========================================================= */

async function openAdmin() {

    const resposta =
        await supabaseClient.auth.getUser();

    if (
        resposta.data.user?.id === ADMIN_ID
    ) {

        openAdminPanel();

        return;
    }

    document.getElementById(
        'modalTitle'
    ).textContent =
        'Login administrativo';

    document.getElementById(
        'modalBody'
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
                id="ae-mail"
                type="email"
                placeholder="Seu e-mail"
            >

        </div>

        <div class="field">

            <label>
                Senha
            </label>

            <input
                id="ae-pass"
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
        .getElementById('modal')
        .classList.add('open');
}


async function adminLogin() {

    const email =
        document.getElementById(
            'ae-mail'
        ).value.trim();

    const senha =
        document.getElementById(
            'ae-pass'
        ).value;

    if (!email || !senha) {

        alert(
            'Informe e-mail e senha.'
        );

        return;
    }

    const resposta =
        await supabaseClient.auth
            .signInWithPassword({
                email,
                password: senha
            });

    if (resposta.error) {

        alert(
            'E-mail ou senha incorretos.'
        );

        return;
    }

    if (
        !resposta.data.user ||
        resposta.data.user.id !== ADMIN_ID
    ) {

        await supabaseClient.auth.signOut();

        alert(
            'Este usuário não tem acesso administrativo.'
        );

        return;
    }

    openAdminPanel();
}


/* =========================================================
   PAINEL ADMINISTRATIVO
========================================================= */

function openAdminPanel() {

    document.getElementById(
        'modalTitle'
    ).textContent =
        'Painel administrativo';

    document.getElementById(
        'modalBody'
    ).innerHTML = `

        <p style="color:var(--muted)">
            Gerencie produtos, preços e estoque.
        </p>

        <div class="field">

            <label>
                Novo produto
            </label>

            <input
                id="an"
                placeholder="Nome do produto"
            >

        </div>

        <div class="field">

            <label>
                Categoria
            </label>

            <input
                id="ac"
                placeholder="Ex.: Freios"
            >

        </div>

        <div class="field">

            <label>
                Preço
            </label>

            <input
                id="ap"
                placeholder="Ex.: 149,90"
            >

        </div>

        <div class="field">

            <label>
                Ícone
            </label>

            <input
                id="ae"
                value="🔧"
            >

        </div>

        <div class="field">

            <label>
                Estoque inicial
            </label>

            <input
                id="as"
                type="number"
                min="0"
                value="1"
            >

        </div>

        <button
            class="primary"
            style="
                width:100%;
                margin-bottom:18px
            "
            onclick="adminAdd()"
        >
            Cadastrar produto
        </button>

        <button
            class="close"
            style="
                width:100%;
                margin-bottom:10px
            "
            onclick="adminLogout()"
        >
            Sair do painel
        </button>

        <div id="adminList"></div>
    `;

    document
        .getElementById('modal')
        .classList.add('open');

    renderAdmin();
}


/* =========================================================
   CADASTRAR PRODUTO
========================================================= */

async function adminAdd() {

    const nome =
        document.getElementById('an')
            .value.trim();

    const categoria =
        document.getElementById('ac')
            .value.trim();

    const preco =
        document.getElementById('ap')
            .value.trim()
            .replace(',', '.');

    const icone =
        document.getElementById('ae')
            .value.trim() || '🔧';

    const estoque =
        Number(
            document.getElementById('as')
                .value
        );

    if (
        !nome ||
        !categoria ||
        preco === '' ||
        Number.isNaN(Number(preco)) ||
        Number(preco) < 0 ||
        estoque < 0
    ) {

        alert(
            'Preencha nome, categoria, preço e estoque corretamente.'
        );

        return;
    }

    const resposta =
        await supabaseClient
            .from('products')
            .insert({
                name: nome,
                category: categoria,
                price: Number(preco),
                stock: estoque,
                image_url: icone,
                active: true
            });

    if (resposta.error) {

        console.error(
            resposta.error
        );

        alert(
            'Não foi possível cadastrar o produto.'
        );

        return;
    }

    await carregarProdutosSupabase();

    openAdminPanel();

    toast(
        'Produto cadastrado'
    );
}


/* =========================================================
   LISTA DE PRODUTOS DO ADMIN
========================================================= */

function renderAdmin() {

    const elemento =
        document.getElementById(
            'adminList'
        );

    if (!elemento) return;

    elemento.innerHTML =
        '<h3>Produtos</h3>' +

        (
            products.length

                ? products.map(produto => {

                    const id =
                        produto[5];

                    const estoque =
                        Number(produto[4]) || 0;

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
                                ${produto[0]}
                            </b>

                            <br>

                            <small>
                                ${produto[1]}
                                ·
                                ${produto[2]}
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
                                    onclick="alterarEstoque('${id}',-1)"
                                >
                                    −
                                </button>

                                <b>
                                    Estoque: ${estoque}
                                </b>

                                <button
                                    class="close"
                                    onclick="alterarEstoque('${id}',1)"
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

                }).join('')

                :

                `
                    <p style="color:var(--muted)">
                        Nenhum produto cadastrado.
                    </p>
                `
        );
}


/* =========================================================
   ALTERAR ESTOQUE
========================================================= */

async function alterarEstoque(
    id,
    diferenca
) {

    const resposta =
        await supabaseClient
            .from('products')
            .select('stock')
            .eq('id', id)
            .single();

    if (
        resposta.error ||
        !resposta.data
    ) {

        console.error(
            resposta.error
        );

        alert(
            'Não foi possível consultar o estoque.'
        );

        return;
    }

    const estoqueAtual =
        Number(
            resposta.data.stock
        ) || 0;

    const novoEstoque =
        Math.max(
            0,
            estoqueAtual +
            Number(diferenca)
        );

    const atualizacao =
        await supabaseClient
            .from('products')
            .update({
                stock: novoEstoque
            })
            .eq('id', id);

    if (atualizacao.error) {

        console.error(
            atualizacao.error
        );

        alert(
            'Não foi possível alterar o estoque.'
        );

        return;
    }

    await carregarProdutosSupabase();

    renderAdmin();

    toast(
        'Estoque atualizado'
    );
}


/* =========================================================
   EXCLUIR PRODUTO
========================================================= */

async function adminRemove(id) {

    if (
        !confirm(
            'Excluir este produto?'
        )
    ) {
        return;
    }

    const resposta =
        await supabaseClient
            .from('products')
            .delete()
            .eq('id', id);

    if (resposta.error) {

        console.error(
            resposta.error
        );

        alert(
            'Não foi possível excluir o produto.'
        );

        return;
    }

    cart =
        cart.filter(
            item => products[item.i]?.[5] !== id
        );

    await carregarProdutosSupabase();

    renderAdmin();

    toast(
        'Produto removido'
    );
}


/* =========================================================
   LOGOUT
========================================================= */

async function adminLogout() {

    await supabaseClient.auth.signOut();

    closeModal();

    toast(
        'Sessão encerrada'
    );
}


/* =========================================================
   CARREGAR PRODUTOS — SOMENTE SUPABASE
========================================================= */

async function carregarProdutosSupabase() {

    const resposta =
        await supabaseClient
            .from('products')
            .select('*')
            .eq('active', true)
            .order(
                'created_at',
                {
                    ascending: false
                }
            );

    if (resposta.error) {

        console.error(
            'Erro ao carregar produtos:',
            resposta.error
        );

        products = [];

        render();

        return;
    }

    products =
        (resposta.data || [])
            .map(produto => [
                produto.name,
                produto.category,
                formatarPreco(
                    produto.price
                ),
                produto.image_url ||
                    '🔧',
                Number(
                    produto.stock
                ) || 0,
                produto.id
            ]);

    render();
}


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

render();

carregarProdutosSupabase();