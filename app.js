import Http from './lib.js'

const rootEl = document.getElementById('root');

const formEl = document.createElement('form');
formEl.innerHTML = `
    <div class="form-group">
        <label>Введите текст или Url</label>
        <input class="form-control" data-type="text">
    </div>
    <div class="form-group">
        <label>Выберите тип поста</label>
        <select class="form-control" data-type="select">
            <option>Обычный</option>
            <option>Картинка</option>
            <option>Видео</option>
            <option>Аудио</option>
        </select>
    </div>
    <button class="btn btn-primary" data-type="button">Добавить</button>
`;

const http = new Http('https://posts-on-express.herokuapp.com');
const handleError = (e) => {
    console.log(e)
}
const loadData = () => {
    http.request('GET', '/posts', rebuildPosts, handleError)
} 

const textEl = formEl.querySelector('[data-type=text]');
textEl.value = localStorage.getItem('text');
textEl.addEventListener('input', e => {
    localStorage.setItem('text', e.currentTarget.value);
})
const selectEl = formEl.querySelector('[data-type=select]');
selectEl.value = localStorage.getItem('type');
selectEl.addEventListener('input', e => {
    localStorage.setItem('type', e.currentTarget.value);
})
const buttonEl = formEl.querySelector('[data-type=button]');
buttonEl.addEventListener('click', e => {
    e.preventDefault();
    const data = {
        text: textEl.value,
        type: selectEl.value,
    };
    http.request('POST', '/posts', e => {
        loadData();
        textEl.value = '';
        selectEl.value = 'Обычный';
        localStorage.clear();
    }, handleError, JSON.stringify(data), [{name: 'Content-Type', value: 'application/json'}]);
})

rootEl.appendChild(formEl);

const postsEl = document.createElement('div');
rootEl.appendChild(postsEl);

function rebuildPosts(e) {
    const data = JSON.parse(e.currentTarget.responseText);

    postsEl.innerHTML = '';

    data.sort(function (a, b) {
        return b.likes - a.likes
    })

    for (const item of data) {
        const newPostEl = document.createElement('div');
        newPostEl.className = 'card mt-3';

        if (item.type === 'Обычный') {
            newPostEl.innerHTML = `
                <div class="card">
                    <div class="card-body">
                        <p class="card-text">${item.text}</p>
                        <button data-action="like" class="btn btn-primary mr-2">❤ ${item.likes}</button>
                        <button data-action="dislike" class="btn btn-primary mr-2">👎</button>
                        <button data-action="delete" class="btn btn-primary">Удалить пост</button>
                    </div>
                </div>
           `;
        } else if (item.type === 'Картинка') {
            newPostEl.innerHTML = `
                <div class="card">
                    <img src="${item.text}" class="card-img-top">
                    <div class="card-body">
                        <button data-action="like" class="btn btn-primary mr-2">❤ ${item.likes}</button>
                        <button data-action="dislike" class="btn btn-primary mr-2">👎</button>
                        <button data-action="delete" class="btn btn-primary">Удалить пост</button>
                    </div>
                </div>
           `;
        } else if (item.type === 'Видео') {
            newPostEl.innerHTML = `
                <div class="card">
                    <div class="card-img-top embed-responsive embed-responsive-16by9">
                        <video src="${item.text}" controls=""></video>
                    </div>
                    <div class="card-body">
                        <button data-action="like" class="btn btn-primary mr-2">❤ ${item.likes}</button>
                        <button data-action="dislike" class="btn btn-primary mr-2">👎</button>
                        <button data-action="delete" class="btn btn-primary">Удалить пост</button>
                    </div>
                </div>
           `;
        } else if (item.type === 'Аудио') {
            newPostEl.innerHTML = `
                <div class="card">
                    <audio controls="" class="card-img-top" src="${item.text}"></audio>
                    <div class="card-body">
                        <button data-action="like" class="btn btn-primary mr-2">❤ ${item.likes}</button>
                        <button data-action="dislike" class="btn btn-primary mr-2">👎</button>
                        <button data-action="delete" class="btn btn-primary">Удалить пост</button>
                    </div>
                </div>
           `;
        }

        newPostEl.addEventListener('click', e => {
            if (e.target.dataset.action === 'like') {
                http.request('DELETE', `/posts/like/${item.id}`, rebuildPosts, handleError);
            } else if (e.target.dataset.action === 'dislike') {
                http.request('DELETE', `/posts/dislike/${item.id}`, rebuildPosts, handleError);
            } else if (e.target.dataset.action === 'delete') {
                http.request('DELETE', `/posts/${item.id}`, rebuildPosts, handleError);
            }
        })

        postsEl.appendChild(newPostEl);
    }
}

loadData();
