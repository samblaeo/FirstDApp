pragma solidity ^0.5.0;

contract TodoList {
    
    uint public taskCount = 0;

    struct Task{

        uint id;

        string content;

        bool completed;
    }

    //Event to create a task from JS - Available inside the smart contract
    event TaskCreated(
        uint id,
        string content,
        bool completed
    );

    //Event to complete a from JS - Available inside the smart contract
    event TaskCompleted(
        uint id,
        bool completed
    );

    constructor() public {

        createTask("Check out Shieldpad.io");
    }

    mapping(uint => Task) public tasks;

    //Function available from JS
    function createTask(string memory _content) public {
        
        taskCount++;

        tasks[taskCount] = Task(taskCount, _content, false);

        //Lanzamos el evento
        emit TaskCreated(taskCount, _content, false);
    }

    //Function available from JS
    function toggleCompleted(uint _id) public {

        Task memory _task = tasks[_id];

        _task.completed = !_task.completed;

        tasks[_id] = _task;

        emit TaskCompleted(_id, _task.completed);
    }
}