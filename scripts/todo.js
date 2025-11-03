class Todo {
  selectors = {
    root: "[data-js-todo]",
    selectorButton: "[data-js-todo-selector]",
    selectorButtonMainText: "[data-js-todo-selector-text]",
    selectorDropdown: "[data-js-todo-dropdown-list]",
    selectorDropdownItem: "[data-js-todo-dropdown-item]",
    selectorArrow: "[data-js-todo-arrow]",
    themeSwitcher: "[data-js-todo-theme-switcher]",
    addTodoButton: "[data-js-todo-add-todos]",
    addTodoModal: "[data-js-todo-add-todos-modal]",
    addTodoModalForm: "[data-js-todo-modal-form]",
    addTodoModalInput: "[data-js-todo-modal-input]",
    addTodoConfirmButton: "[data-js-todo-modal-add-button]",
    addTodoCloseButton: "[data-js-todo-modal-close-button]",
    todoInput: "[data-js-todo-input-checkbox]",
    todoForm: "[data-js-todo-form]",
    todoLabel: "[data-js-todo-label]",
    todosList: "[data-js-todo-todos-wrapper]",
    emptyMessage: "[data-js-empty-message]",
    searchForm: "[data-js-todo-search-form]",
    searchInput: "[data-js-todo-search-form-input]",
    editTodosButton: "[data-js-todo-edit-todos-button]",
    deleteTodosButton: "[data-js-todo-delete-todos-button]",
    notificationDelete: "[data-js-todo-notification-delete]",
    counterNumber: "[data-js-todo-number-counter]",
  }

  stateClasses = {
    isVisibleButton: "is-visible-button", // selector button
    isRotate: "is-rotate", // arrow in selector
    darkTheme: "dark", // theme-switcher
    isOpen: "is-open", // modal -> addTodoModalElement
    isVisible: "is-visible", // empty message
    isVisibleNotification: "is-visible-notification" // notification delete
  }

  localStorageKeys = {
    theme: "theme",
    todos: "todos",
  }


  constructor() {
    this.rootElement = document.querySelector(this.selectors.root)

    // selector
    this.selectorButtonElement = this.rootElement.querySelector(this.selectors.selectorButton)
    this.selectorDropdownItemElement = this.selectorButtonElement.querySelector(this.selectors.selectorButtonMainText)
    this.selectorDropdownElement = this.selectorButtonElement.querySelector(this.selectors.selectorDropdown)
    this.selectorDropdownElements = this.selectorButtonElement.querySelectorAll(this.selectors.selectorDropdownItem)
    this.selectorArrowElement = this.selectorButtonElement.querySelector(this.selectors.selectorArrow)

    // theme switcher
    this.themeSwitcherElement = this.rootElement.querySelector(this.selectors.themeSwitcher)

    // add todos
    this.addTodoButtonElement = this.rootElement.querySelector(this.selectors.addTodoButton)
    this.addTodoModalElement = this.rootElement.querySelector(this.selectors.addTodoModal)
    this.addTodoModalInputElement = this.addTodoModalElement.querySelector(this.selectors.addTodoModalInput)
    this.addTodoModalFormElement = this.addTodoModalElement.querySelector(this.selectors.addTodoModalForm)
    this.addTodoCloseButton = this.addTodoModalElement.querySelector(this.selectors.addTodoCloseButton)

    // empty message
    this.todosListElement = this.rootElement.querySelector(this.selectors.todosList)
    this.emptyMessageElement = this.rootElement.querySelector(this.selectors.emptyMessage)

    // search
    this.searchFormElement = this.rootElement.querySelector(this.selectors.searchForm)
    this.searchInputElement = this.searchFormElement.querySelector(this.selectors.searchInput)

    // notification-delete
    this.notificationDeleteElement = this.rootElement.querySelector(this.selectors.notificationDelete)
    this.counterNumberElement = this.notificationDeleteElement.querySelector(this.selectors.counterNumber)

    this.state = {
      items: this.getTodoFromLocalStorage(),
      filter: {
        textFilter: null,
        selectorFilter: null,
      },
      deletedTodos: [],
      deleteTimeout: null,
      counterInterval: null,
    }

    this.render()

    this.getThemeFromLocal()
    this.setDefaultTheme()

    this.init()
  }


  render() {
    this.todosListElement.innerHTML = ''

    const filteredItems = this.getFilteredItems()

    filteredItems.forEach((item) => {
      this.todosListElement.appendChild(this.createTodo(item))
    })

    this.todosListElement.children.length < 1
      ? this.emptyMessageElement.classList.add(this.stateClasses.isVisible)
      : this.emptyMessageElement.classList.remove(this.stateClasses.isVisible)
  }

  // search
  getTodoFromLocalStorage() {
    const dataTodo = localStorage.getItem(this.localStorageKeys.todos)
    if (!dataTodo) {
      return []
    }

    try {
      const dataTodoParsed = JSON.parse(dataTodo)
      return Array.isArray(dataTodoParsed) ? dataTodoParsed : []
    } catch (e) {
      console.log("Произошла ошибка при парсинге данных локального хранилища", e.message)
      return []
    }
  }

  getFilteredItems() {
    let filtered = [...this.state.items]

    if (this.state.filter.selectorFilter === 'checked') {
      filtered = filtered.filter(item => item.checked)
    } else if (this.state.filter.selectorFilter === 'unchecked') {
      filtered = filtered.filter(item => !item.checked)
    }

    if (this.state.filter.textFilter) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(this.state.filter.textFilter.toLowerCase())
      )
    }

    const unchecked = filtered.filter(item => !item.checked)
    const checked = filtered.filter(item => item.checked)

    return [...unchecked, ...checked]
  }

  saveTodoToLocalStorage() {
    localStorage.setItem(
      this.localStorageKeys.todos,
      JSON.stringify(this.state.items),
    )
  }

  // modal
  closeModal() {
    this.addTodoModalElement.classList.remove(this.stateClasses.isOpen)
    this.addTodoModalInputElement.value = ""
  }

  // Theme-switcher
  getThemeFromLocal() {
    if (!localStorage.getItem(this.localStorageKeys.theme)) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      localStorage.setItem(this.localStorageKeys.theme, prefersDark ? "dark" : "light")
    }
  }

  setDefaultTheme() {
    localStorage.getItem(this.localStorageKeys.theme) === "dark"
      ? document.body.classList.add(this.stateClasses.darkTheme)
      : document.body.classList.remove(this.stateClasses.darkTheme)
  }

  // add Todos
  createTodo({title, id, checked}) {
    try {
      const todo = document.createElement("form")
      todo.classList.add("form")
      todo.setAttribute("data-todo-id", id)
      if (checked) {
        todo.classList.add("form--checked")
      }
      todo.innerHTML = `
      <div class="form-input" data-js-todo-form>
        <input
          class="form-input__checkbox"
          id="${id}"
          type="checkbox"
          ${checked ? 'checked' : ''}
          data-js-todo-input-checkbox
        />
        <label
          class="form-input__title"
          for="${id}"
          data-js-todo-label
        >
          ${title}
        </label>
      </div>
      <div class="form-buttons">
        <button
          class="form-buttons-edit"
          type="button"
          data-js-todo-edit-todos-button
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8.67272 5.99106L2 12.6637V16H5.33636L12.0091 9.32736M8.67272 5.99106L11.0654 3.59837L11.0669 3.59695C11.3962 3.26759 11.5612 3.10261 11.7514 3.04082C11.9189 2.98639 12.0993 2.98639 12.2669 3.04082C12.4569 3.10257 12.6217 3.26735 12.9506 3.59625L14.4018 5.04738C14.7321 5.37769 14.8973 5.54292 14.9592 5.73337C15.0136 5.90088 15.0136 6.08133 14.9592 6.24885C14.8974 6.43916 14.7324 6.60414 14.4025 6.93398L14.4018 6.93468L12.0091 9.32736M8.67272 5.99106L12.0091 9.32736" stroke="#CDCDCD" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <button
          class="form-buttons-delete"
          type="button"
          data-js-todo-delete-todos-button
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3.87414 7.61505C3.80712 6.74386 4.49595 6 5.36971 6H12.63C13.5039 6 14.1927 6.74385 14.1257 7.61505L13.6064 14.365C13.5463 15.1465 12.8946 15.75 12.1108 15.75H5.88894C5.10514 15.75 4.45348 15.1465 4.39336 14.365L3.87414 7.61505Z" stroke="#CDCDCD"/>
            <path d="M14.625 3.75H3.375" stroke="#CDCDCD" stroke-linecap="round"/>
            <path d="M7.5 2.25C7.5 1.83579 7.83577 1.5 8.25 1.5H9.75C10.1642 1.5 10.5 1.83579 10.5 2.25V3.75H7.5V2.25Z" stroke="#CDCDCD"/>
            <path d="M10.5 9V12.75" stroke="#CDCDCD" stroke-linecap="round"/>
            <path d="M7.5 9V12.75" stroke="#CDCDCD" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
    `
      return todo
    } catch (e) {
      console.log('Wrong name for todo')
    }

  }


  // Todos functionals button
  deleteTodo(id) {
    const indexTodo = this.state.items.findIndex(item => item.id === id)
    if (indexTodo === -1) return

    const deletedTodo = this.state.items[indexTodo]
    this.state.deletedTodos.push({
      todo: deletedTodo,
      index: indexTodo,
    })

    this.state.items.splice(indexTodo, 1)

    this.saveTodoToLocalStorage()
    this.render()
  }

  // Deleting
  processDeleting(id) {
    this.deleteTodo(id)
    this.showUndoNotification()
  }

  showUndoNotification() {
    if (this.state.deleteTimeout) {
      clearTimeout(this.state.deleteTimeout)
    }
    if (this.state.counterInterval) {
      clearInterval(this.state.counterInterval)
    }
    this.notificationDeleteElement.classList.add(this.stateClasses.isVisibleNotification)
    this.startNumberCounter()

    this.state.deleteTimeout = setTimeout(() => {
      this.confirmDeletion()
      this.hideUndoNotification()
    }, 5000)
  }

  confirmDeletion() {
    this.state.deletedTodos = []

    if (this.state.deleteTimeout) {
      clearTimeout(this.state.deleteTimeout)
      this.state.deleteTimeout = null
    }
  }

  hideUndoNotification() {
    this.notificationDeleteElement?.classList.remove(this.stateClasses.isVisibleNotification)

    if (this.state.counterInterval) {
      clearInterval(this.state.counterInterval)
      this.state.counterInterval = null
    }
  }

  startNumberCounter() {
    let numberValue  = 5

    this.counterNumberElement.innerHTML = numberValue

    this.state.counterInterval = setInterval(() => {
      numberValue--

      if (this.counterNumberElement) {
        this.counterNumberElement.innerHTML = numberValue
      }

      if (numberValue === 0) {
        clearInterval(this.state.counterInterval)
        this.state.counterInterval = null
      }
    }, 1000)
  }

  undoDelete() {
    if (this.state.deletedTodos.length === 0) return

    this.state.deletedTodos.reverse().forEach(({ todo, index }) => {
      if (index <= this.state.items.length) {
        this.state.items.splice(index, 0, todo)
      } else {
        this.state.items.push(todo)
      }
    })

    this.state.deletedTodos = []

    if (this.state.deleteTimeout) {
      clearTimeout(this.state.deleteTimeout)
      this.state.deleteTimeout = null
    }

    this.saveTodoToLocalStorage()
    this.hideUndoNotification()
    this.render()
  }

  editTodo(id) {
    const todo = this.state.items.find(item => item.id === id)
    if (!todo) return

    const todoForm = this.todosListElement.querySelector(`[data-todo-id="${id}"]`)
    if (!todoForm) return

    const label = todoForm.querySelector(this.selectors.todoLabel)
    if (!label) return

    const currentTitle = todo.title

    const editInput = document.createElement('input')
    editInput.type = 'text'
    editInput.value = currentTitle
    editInput.className = 'form-input__edit'

    label.replaceWith(editInput)
    editInput.focus()
    editInput.select()

    const saveEdit = () => {
      const newTitle = editInput.value.trim()

      if (newTitle !== currentTitle) {
        todo.title = newTitle
        this.saveTodoToLocalStorage()
        this.render()
      } else if (!newTitle) {
        this.render()
      } else {
        this.render()
      }
    }

    editInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        saveEdit()
      } else if (e.key === 'Escape') {
        this.render()
      }
    })

    editInput.addEventListener('blur', saveEdit)
  }


  // arrow-functions

  openDropdownList = (e) => {
    e.stopPropagation()
    this.selectorDropdownElement.classList.toggle(this.stateClasses.isVisibleButton)
    this.selectorArrowElement.classList.toggle(this.stateClasses.isRotate)
  }

  openDropdownItem = ({ target }) => {
    this.selectorDropdownItemElement.innerHTML = target.textContent
    this.onSelectorValueChange(target.textContent.toLowerCase())
  }

  onSelectorValueChange(selector) {
    switch(selector) {
      case "all tasks":
        this.state.filter.selectorFilter = null
        break
      case "checked" :
        this.state.filter.selectorFilter = "checked"
        break
      case "unchecked":
        this.state.filter.selectorFilter = "unchecked"
    }
    this.render()
  }

  onDocClick = () => {
    if (this.selectorDropdownElement.classList.contains(this.stateClasses.isVisibleButton)) {
      this.selectorDropdownElement.classList.remove(this.stateClasses.isVisibleButton)
    }
  }

  openModal = () => {
    this.addTodoModalElement.classList.toggle(this.stateClasses.isOpen)
    this.addTodoModalInputElement.focus()
  }

  changeTheme = () => {
    document.body.classList.toggle(this.stateClasses.darkTheme)
    const isDark = document.body.classList.contains(this.stateClasses.darkTheme)
    localStorage.setItem(this.localStorageKeys.theme, isDark ? "dark" : "light")
  }

  closeModalOnButton = () => {
    this.closeModal()
  }

  addTodos = (e) => {
    e.preventDefault()
    const dataTodo = {
      title: Object.fromEntries(new FormData(e.target)).title,
      id: crypto?.randomUUID() ?? Date.now().toString(),
      checked: false,
    }
    // this.todosListElement.appendChild(this.createTodo(dataTodo))
    this.state.items.push(dataTodo)
    this.saveTodoToLocalStorage()
    this.render()
    this.closeModal()
  }

  onEscModal = (e) => {
    if (e.code === "Escape") {
        this.closeModal()
    }
  }

  onCheckedTodo = (e) => {
    if (!e.target.matches(this.selectors.todoInput)) return

    const checkbox = e.target
    const todoId = checkbox.id
    const isChecked = checkbox.checked

    const todo = this.state.items.find(item => item.id === todoId)
    if (todo) {
      todo.checked = isChecked
      this.saveTodoToLocalStorage()
    }
    const timeToDelete = setInterval(() => {
      this.render()
      clearInterval(timeToDelete)
    }, 400)
  }

  onSearchFormSubmit = (e) => {
    e.preventDefault()
  }

  onSearchInput = ({ target }) => {
    const value = target.value.trim()
    if (value.length > 0) {
      this.state.filter.textFilter = value
      this.render()
    } else {
      this.state.filter.textFilter = ""
      this.render()
    }
  }

  onClickDeleteTodoButton = (e) => {
    const todoElement = e.target.closest('.form')
    if (!todoElement)  return
    const idTodo = todoElement.querySelector(this.selectors.todoInput)
    if (idTodo) {
      this.processDeleting(idTodo.id)
    }
  }

  onClickEditTodoButton = (e) => {
    const todoElement = e.target.closest(".form")
    if (!todoElement) return

    const idTodo = todoElement.getAttribute("data-todo-id")
    if (idTodo) {
      this.editTodo(idTodo)
    }
  }

  onClickUndoButton = () => {
    this.undoDelete()
  }

  init() {
    document.addEventListener("click", this.onDocClick)
    this.addTodoModalElement.addEventListener("keydown", this.onEscModal)
    this.selectorButtonElement.addEventListener("click", this.openDropdownList)
    this.selectorDropdownElements.forEach((el) => {
      el.addEventListener("click", this.openDropdownItem)
    })
    this.themeSwitcherElement.addEventListener("click", this.changeTheme)
    this.addTodoButtonElement.addEventListener("click", this.openModal)
    this.addTodoCloseButton.addEventListener("click", this.closeModalOnButton)
    this.addTodoModalFormElement.addEventListener("submit", this.addTodos)
    this.todosListElement.addEventListener("change", this.onCheckedTodo)
    this.searchFormElement.addEventListener("submit", this.onSearchFormSubmit)
    this.searchInputElement.addEventListener("input", this.onSearchInput)
    this.todosListElement.addEventListener("click", (e) => {
      if (e.target.closest(this.selectors.deleteTodosButton)) {
        this.onClickDeleteTodoButton(e)
      }
      if (e.target.closest(this.selectors.editTodosButton)) {
        this.onClickEditTodoButton(e)
      }
    })
    this.notificationDeleteElement?.addEventListener("click", this.onClickUndoButton)
  }
}

new Todo()