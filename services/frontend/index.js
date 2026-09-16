const API_URL = window.location.hostname.endsWith('.app.github.dev')
    ? `${window.location.protocol}//${window.location.hostname.replace('-5000.', '-3000.')}`
    : 'http://localhost:3000';

function newBook(book) {
    const div = document.createElement('div');
    div.className = 'column is-4';

    div.innerHTML = `
        <div class="card is-shady">
            <div class="card-image">
                <figure class="image is-4by3">
                    <img
                        src="${book.photo}"
                        alt="${book.name}"
                        class="modal-button"
                    />
                </figure>
            </div>

            <div class="card-content">
                <div class="content book" data-id="${book.id}">
                    <div class="book-meta">
                        <p class="is-size-4">R$${book.price.toFixed(2)}</p>
                        <p class="is-size-6">Disponível em estoque: 5</p>
                        <h4 class="is-size-3 title">${book.name}</h4>
                        <p class="subtitle">${book.author}</p>
                    </div>

                    <div class="field has-addons">
                        <div class="control">
                            <input
                                class="input"
                                type="text"
                                placeholder="Digite o CEP"
                            />
                        </div>

                        <div class="control">
                            <a
                                class="button button-shipping is-info"
                                data-id="${book.id}"
                            >
                                Calcular Frete
                            </a>
                        </div>
                    </div>

                    <button class="button button-buy is-success is-fullwidth">
                        Comprar
                    </button>
                </div>
            </div>
        </div>
    `;

    return div;
}

function calculateShipping(id, cep) {
    fetch(API_URL + '/shipping/' + cep)
        .then((data) => {
            if (data.ok) {
                return data.json();
            }

            throw data.statusText;
        })
        .then((data) => {
            swal(
                'Frete',
                `O frete é: R$${data.value.toFixed(2)}`,
                'success'
            );
        })
        .catch((err) => {
            swal(
                'Erro',
                'Erro ao consultar frete',
                'error'
            );

            console.error(err);
        });
}

function addBookEvents() {
    document.querySelectorAll('.button-shipping').forEach((btn) => {
        btn.addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            const cep = document.querySelector(`.book[data-id="${id}"] input`).value;
            calculateShipping(id, cep);
        });
    });

    document.querySelectorAll('.button-buy').forEach((btn) => {
        btn.addEventListener('click', () => {
            swal('Compra de livro', 'Sua compra foi realizada com sucesso', 'success');
        });
    });
}

function showBooks(booksElement, books) {
    booksElement.innerHTML = '';
    books.forEach((book) => {
        booksElement.appendChild(newBook(book));
    });
    addBookEvents();
}

function listAllProducts(booksElement) {
    fetch(API_URL + '/products')
        .then((data) => {
            if (data.ok) {
                return data.json();
            }
        throw data.statusText;
        })
        .then((data) => {
            showBooks(booksElement, data);
        })
        .catch((err) => {
            swal('Erro', 'Erro ao listar os produtos', 'error');
            console.error(err);
        });
}

function searchProductByID(booksElement, id) {
    fetch(API_URL + '/product/' + id)
        .then((data) => {
            if (data.ok) {
                return data.json();
            }
            throw data.statusText;
        })
        .then((book) => {
            if (!book || !book.id) {
                swal('Produto não encontrado', 'Não existe livro com esse ID', 'warning');
                return;
            }
            showBooks(booksElement, [book]);
        })
        .catch((err) => {
            swal('Erro', 'Erro ao pesquisar o produto', 'error');
            console.error(err);
        });
}

document.addEventListener('DOMContentLoaded', function () {
    const books = document.querySelector('.books');
    const productId = document.querySelector('#product-id');
    const searchButton = document.querySelector('#button-search');
    const listAllButton = document.querySelector('#button-list-all');

    listAllProducts(books);

    searchButton.addEventListener('click', () => {
        const id = productId.value;
        if (!id) {
            swal('Atenção', 'Digite o ID do livro', 'warning');
            return;
        }
        searchProductByID(books, id);
    });

    listAllButton.addEventListener('click', () => {
        productId.value = '';
        listAllProducts(books);
    });
});