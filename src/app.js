App = {

    loading: false,
    contracts: {},

    load: async() => {

        await App.loadWeb3()
        await App.loadAccount()
        await App.loadContract()
        await App.loadTodoList()
        await App.render()
        await App.loadAccountChanged()
    },

    // https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
    loadWeb3: async() => {
        if (typeof web3 !== 'undefined') {
            App.web3Provider = web3.currentProvider
            web3 = new Web3(web3.currentProvider)
        } else {
            window.alert("Please connect to Metamask.")
        }
        // Modern dapp browsers...
        if (window.ethereum) {
            window.web3 = new Web3(ethereum)
            try {
                // Request account access if needed
                await ethereum.enable()
                    // Acccounts now exposed
                web3.eth.sendTransaction({ /* ... */ })
            } catch (error) {
                // User denied account access...
            }
        }
        // Legacy dapp browsers...
        else if (window.web3) {
            App.web3Provider = web3.currentProvider
            window.web3 = new Web3(web3.currentProvider)
                // Acccounts always exposed
            web3.eth.sendTransaction({ /* ... */ })
        }
        // Non-dapp browsers...
        else {
            console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
        }
    },

    loadTodoList: async() => {


    },

    loadAccount: async() => {

        const accounts = await web3.eth.getAccounts()

        App.account = accounts[0]
    },

    loadContract: async() => {

        //Create a JavaScript version of the smart contract
        const todoList = await $.getJSON('TodoList.json')
        App.contracts.TodoList = TruffleContract(todoList)
        App.contracts.TodoList.setProvider(App.web3Provider)

        //Hydrate the smart contract with values from the blockchain
        App.todoList = await App.contracts.TodoList.deployed()
    },

    render: async() => {

        //Prevent double render
        if (App.loading)
            return

        //Update app loading state
        App.setLoading(true)

        //Render account
        $('#account').html(App.account)

        //Render tasks
        await App.renderTasks()

        //Update loading state
        App.setLoading(false)
    },

    renderTasks: async() => {

        //Load the total task count from the blockchain

        const taskCount = await App.todoList.taskCount()

        const $taskTemplate = $('.taskTemplate')

        //Render out each task with a new task template

        for (var ii = 1; ii <= taskCount; ii++) {

            //Fetch the task data from the blockchain
            const task = await App.todoList.tasks(ii)

            const taskId = task[0].toNumber()

            console.log("Task id: " + taskId)

            const taskContent = task[1]

            const taskCompleted = task[2]

            const $newTaskTemplate = $taskTemplate.clone()

            $newTaskTemplate.find('.content').html(taskContent)
            $newTaskTemplate.find('input')
                .prop('name', taskId)
                .prop('checked', taskCompleted)
                .on('click', App.toggleCompleted)

            if (taskCompleted)
                $('#completedTaskList').append($newTaskTemplate)
            else
                $('#taskList').append($newTaskTemplate)

            //Show the task

            $newTaskTemplate.show()
        }
    },

    createTask: async() => {

        App.setLoading(true)

        const content = $('#newTask').val()

        await App.todoList.createTask(content, { from: App.account })

        window.location.reload()
    },

    toggleCompleted: async(e) => {

        App.setLoading(true)

        const taskId = e.target.name

        await App.todoList.toggleCompleted(taskId, { from: App.account })

        window.location.reload()
    },

    setLoading: (boolean) => {
        App.loading = boolean
        const loader = $('#loader')
        const content = $('#content')

        if (boolean) {
            loader.show()
            content.hide()
        } else {
            loader.hide()
            content.show()
        }
    },

    loadAccountChanged: () => {

        Moralis.Web3.onAccountsChanged(async function(accounts) {

            App.setLoading(true);

            App.account = accounts[0]

            App.loadAccount()

            App.render();

            window.location.reload()

            App.setLoading(false);
        });
    }
}

$(() => {

    $(window).load(() => {

        App.load()
    })
})