(function () {
  const $inputTodo = document.querySelector('.input-todo');
  const $todos = document.querySelector('.todos');
  const $customCheckbox = document.querySelector('.custom-checkbox');
  const $btn = document.querySelector('.clear-completed > .btn');
  const $completedTodo = document.querySelector('.completed-todos');
  const $activeTodos = document.querySelector('.active-todos');
  const $nav = document.querySelector('.nav');
  let navId = 'all';
  let todos = [];

  function render(resTodo) {
    if (resTodo) todos = resTodo;
    let html = '';

    function addHTML(todosList) {
      let newhtml = '';
      todosList.forEach(({ id, content, completed }) => {
        newhtml += `<li id="${id}" class="todo-item"><input class="custom-checkbox" type="checkbox" ${completed ? 'checked' : ''} id= "ck-${id}"><label for="ck-${id}">${content}</label><i class="remove-todo far fa-times-circle"></i></li>`;
      });
      return newhtml;
    }

    if (navId === 'all') {
      html = addHTML(todos);
    } else {
      html = addHTML(todos.filter(({ completed }) => (navId === 'active' ? !completed : completed)));
    }

    $todos.innerHTML = html;
    $completedTodo.innerHTML = todos.filter(({ completed }) => completed).length;
    $activeTodos.innerHTML = todos.filter(({ completed }) => !completed).length;
  }

  function getTodos() {
    fetch('/todos')
      .then(res => res.json())
      .then(render)
      .catch(console.error);
  }

  function generatedId() {
    return todos.length ? Math.max(...todos.map(todo => todo.id + 1)) : 1;
  }

  function addTodo(content) {
    fetch('/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: generatedId(), content, completed: false })
    }).then(res => res.json())
      .then(render)
      .catch(console.log);
  }

  function complete(targetID) {
    todos.forEach(todo => {
      if (todo.id === +targetID) {
        fetch(`/todos/${todo.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ completed: !todo.completed })
        }).then(res => res.json())
          .then(render)
          .catch(console.log);
      }
    });
  }

  function removeTodo(targetID) {
    todos.forEach(todo => {
      if (todo.id === +targetID) {
        fetch(`/todos/${todo.id}`, {
          method: 'DELETE'
        }).then(res => res.json())
          .then(render)
          .catch(console.log);
      }
    });
  }

  function completeAll(complete) {
    fetch('/todos', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: complete.checked })
    }).then(res => res.json())
      .then(render)
      .catch(console.log);
  }

  function clearCompleted() {
    fetch('/todos/completed', {
      method: 'DELETE'
    }).then(res => res.json())
      .then(render)
      .catch(console.log);
  }

  window.onload = () => { getTodos(); };

  $todos.addEventListener('click', e => {
    if (!e.target.classList.contains('remove-todo')) return;
    removeTodo(e.target.parentNode.id);
  });

  $todos.addEventListener('change', e => {
    complete(e.target.parentNode.id);
  });

  $inputTodo.addEventListener('keyup', e => {
    const content = $inputTodo.value.trim();
    if (content === '' || e.keyCode !== 13) return;

    addTodo(content);
    $inputTodo.value = '';
  });

  $nav.addEventListener('click', e => {
    [...$nav.children].forEach(navitem => {
      if (navitem.id !== e.target.id) {
        navitem.classList.remove('active');
      } else {
        navitem.classList.add('active');
      }
    });
    navId = e.target.id;
    render();
  });


  $customCheckbox.addEventListener('click', e => {
    completeAll(e.target);
  });

  $btn.addEventListener('click', () => {
    clearCompleted();
  });
}());
