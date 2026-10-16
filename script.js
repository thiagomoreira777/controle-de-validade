const formulario = document.getElementById("formulario-produto");
const formProduto = document.getElementById("form-produto");
const botaoAbrir = document.getElementById("abrir-formulario");
const botaoCancelar = document.getElementById("cancelar-cadastro");
const corpoTabela = document.getElementById("corpo-tabela");
const campoPesquisa = document.getElementById("pesquisa-produto");

const campoNome = document.getElementById("nome");
const campoCategoria = document.getElementById("categoria");
const campoQuantidade = document.getElementById("quantidade");
const campoValidade = document.getElementById("validade");

const botaoSalvar = formProduto.querySelector('button[type="submit"]');

const CHAVE_ARMAZENAMENTO = "controleValidadeProdutos";

let produtoEmEdicao = null;

function carregarProdutos() {
    try {
        const dadosSalvos = localStorage.getItem(CHAVE_ARMAZENAMENTO);

        if (dadosSalvos !== null) {
            const produtosSalvos = JSON.parse(dadosSalvos);

            if (Array.isArray(produtosSalvos)) {
                return produtosSalvos;
            }
        }
    } catch (erro) {
        console.error("Erro ao carregar produtos:", erro);
    }

    return [
        {
            id: 1,
            nome: "Leite Integral",
            categoria: "Laticínios",
            quantidade: 20,
            validade: "2026-10-15"
        },
        {
            id: 2,
            nome: "Arroz 5kg",
            categoria: "Alimentos",
            quantidade: 35,
            validade: "2027-05-20"
        }
    ];
}

let produtos = carregarProdutos();

function salvarProdutos() {
    try {
        localStorage.setItem(
            CHAVE_ARMAZENAMENTO,
            JSON.stringify(produtos)
        );

        return true;
    } catch (erro) {
        console.error("Erro ao salvar produtos:", erro);
        alert("Não foi possível salvar os dados no navegador.");
        return false;
    }
}

function calcularStatus(validade) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const dataValidade = new Date(validade + "T00:00:00");
    const diferenca =
        dataValidade.getTime() - hoje.getTime();

    const diasRestantes = Math.ceil(
        diferenca / (1000 * 60 * 60 * 24)
    );

    if (diasRestantes < 0) {
        return "Vencido";
    }

    if (diasRestantes <= 30) {
        return "Próximo";
    }

    return "Válido";
}

function formatarData(data) {
    const partes = data.split("-");
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function atualizarResumo() {
    document.getElementById("total-produtos").textContent =
        produtos.length;

    document.getElementById("total-validos").textContent =
        produtos.filter(
            produto => calcularStatus(produto.validade) === "Válido"
        ).length;

    document.getElementById("total-proximos").textContent =
        produtos.filter(
            produto => calcularStatus(produto.validade) === "Próximo"
        ).length;

    document.getElementById("total-vencidos").textContent =
        produtos.filter(
            produto => calcularStatus(produto.validade) === "Vencido"
        ).length;
}

function criarBotao(texto, classe, idProduto) {
    const botao = document.createElement("button");

    botao.type = "button";
    botao.className = classe;
    botao.dataset.id = idProduto;
    botao.textContent = texto;

    return botao;
}

function mostrarProdutos() {
    const pesquisa = campoPesquisa.value.trim().toLowerCase();

    const produtosFiltrados = produtos.filter(produto =>
        produto.nome.toLowerCase().includes(pesquisa) ||
        produto.categoria.toLowerCase().includes(pesquisa)
    );

    corpoTabela.innerHTML = "";

    if (produtosFiltrados.length === 0) {
        const linha = document.createElement("tr");
        const celula = document.createElement("td");

        celula.colSpan = 6;
        celula.textContent = "Nenhum produto encontrado.";

        linha.appendChild(celula);
        corpoTabela.appendChild(linha);

        atualizarResumo();
        return;
    }

    produtosFiltrados.forEach(produto => {
        const status = calcularStatus(produto.validade);
        const classeStatus = status
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();

        const linha = document.createElement("tr");

        const celulaNome = document.createElement("td");
        celulaNome.textContent = produto.nome;

        const celulaCategoria = document.createElement("td");
        celulaCategoria.textContent = produto.categoria;

        const celulaQuantidade = document.createElement("td");
        celulaQuantidade.textContent = produto.quantidade;

        const celulaValidade = document.createElement("td");
        celulaValidade.textContent = formatarData(produto.validade);

        const celulaStatus = document.createElement("td");
        const etiquetaStatus = document.createElement("span");

        etiquetaStatus.className = `status ${classeStatus}`;
        etiquetaStatus.textContent = status;
        celulaStatus.appendChild(etiquetaStatus);

        const celulaAcoes = document.createElement("td");

        const botaoEditar = criarBotao(
            "Editar",
            "botao-editar",
            produto.id
        );

        const botaoExcluir = criarBotao(
            "Excluir",
            "botao-excluir",
            produto.id
        );

        celulaAcoes.append(botaoEditar, botaoExcluir);

        linha.append(
            celulaNome,
            celulaCategoria,
            celulaQuantidade,
            celulaValidade,
            celulaStatus,
            celulaAcoes
        );

        corpoTabela.appendChild(linha);
    });

    atualizarResumo();
}

function abrirFormulario() {
    formulario.hidden = false;

    formulario.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

    campoNome.focus();
}

function iniciarEdicao(id) {
    const produto = produtos.find(
        item => Number(item.id) === Number(id)
    );

    if (!produto) {
        alert("Não foi possível encontrar esse produto.");
        return;
    }

    produtoEmEdicao = produto.id;

    campoNome.value = produto.nome;
    campoCategoria.value = produto.categoria;
    campoQuantidade.value = produto.quantidade;
    campoValidade.value = produto.validade;

    botaoSalvar.textContent = "Salvar alterações";

    abrirFormulario();
}

function fecharFormulario() {
    formProduto.reset();
    produtoEmEdicao = null;

    botaoSalvar.textContent = "Cadastrar produto";
    formulario.hidden = true;
}

botaoAbrir.addEventListener("click", function () {
    fecharFormulario();
    abrirFormulario();
});

botaoCancelar.addEventListener("click", fecharFormulario);

formProduto.addEventListener("submit", function (evento) {
    evento.preventDefault();

    const nome = campoNome.value.trim();
    const categoria = campoCategoria.value.trim();
    const quantidade = Number(campoQuantidade.value);
    const validade = campoValidade.value;

    if (
        !nome ||
        !categoria ||
        !Number.isInteger(quantidade) ||
        quantidade < 1 ||
        !validade
    ) {
        alert("Preencha todos os campos corretamente.");
        return;
    }

    const dataEscolhida = new Date(validade + "T00:00:00");

    if (Number.isNaN(dataEscolhida.getTime())) {
        alert("Informe uma data de validade válida.");
        return;
    }

    if (produtoEmEdicao !== null) {
        const indice = produtos.findIndex(
            produto => Number(produto.id) === Number(produtoEmEdicao)
        );

        if (indice === -1) {
            alert("Não foi possível encontrar o produto para editar.");
            return;
        }

        const produtoAnterior = produtos[indice];

        produtos[indice] = {
            ...produtoAnterior,
            nome,
            categoria,
            quantidade,
            validade
        };
    } else {
        const novoProduto = {
            id: Date.now(),
            nome,
            categoria,
            quantidade,
            validade
        };

        produtos.push(novoProduto);
    }

    if (!salvarProdutos()) {
        return;
    }

    mostrarProdutos();
    fecharFormulario();

    alert(
        produtoEmEdicao === null
            ? "Produto cadastrado com sucesso!"
            : "Produto atualizado com sucesso!"
    );
});

corpoTabela.addEventListener("click", function (evento) {
    const botao = evento.target.closest("button[data-id]");

    if (!botao) {
        return;
    }

    const id = Number(botao.dataset.id);

    if (botao.classList.contains("botao-editar")) {
        iniciarEdicao(id);
        return;
    }

    if (botao.classList.contains("botao-excluir")) {
        const confirmar = confirm(
            "Tem certeza de que deseja excluir este produto?"
        );

        if (!confirmar) {
            return;
        }

        produtos = produtos.filter(
            produto => Number(produto.id) !== id
        );

        if (produtoEmEdicao !== null &&
            Number(produtoEmEdicao) === id) {
            fecharFormulario();
        }

        if (salvarProdutos()) {
            mostrarProdutos();
        }
    }
});

campoPesquisa.addEventListener("input", mostrarProdutos);

mostrarProdutos();