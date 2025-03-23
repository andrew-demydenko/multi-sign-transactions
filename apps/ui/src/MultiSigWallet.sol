// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MultiSigWallet {
    address[] public owners;
    mapping(address => bool) public isOwner;
    uint public requiredSignatures;

    struct Transaction {
        address to;
        uint value;
        bytes data;
        bool executed;
        uint numConfirmations;
    }

    Transaction[] public transactions;
    mapping(uint => mapping(address => bool)) public confirmations;

    event Deposit(address indexed sender, uint amount);
    event SubmitTransaction(
        address indexed owner,
        uint indexed txIndex,
        address indexed to,
        uint value
    );
    event ConfirmTransaction(address indexed owner, uint indexed txIndex);
    event ExecuteTransaction(address indexed owner, uint indexed txIndex);

    modifier onlyOwner() {
        require(isOwner[msg.sender], "Not an owner");
        _;
    }

    modifier txExists(uint _txIndex) {
        require(_txIndex < transactions.length, "Tx does not exist");
        _;
    }

    modifier notExecuted(uint _txIndex) {
        require(!transactions[_txIndex].executed, "Tx already executed");
        _;
    }

    modifier notConfirmed(uint _txIndex) {
        require(!confirmations[_txIndex][msg.sender], "Tx already confirmed");
        _;
    }

    constructor(address[] memory _owners, uint _requiredSignatures) {
        require(_owners.length > 0, "Owners required");
        require(
            _requiredSignatures > 0 && _requiredSignatures <= _owners.length,
            "Invalid required signatures"
        );

        for (uint i = 0; i < _owners.length; i++) {
            address owner = _owners[i];
            require(owner != address(0), "Invalid owner");
            require(!isOwner[owner], "Owner not unique");

            isOwner[owner] = true;
            owners.push(owner);
        }

        requiredSignatures = _requiredSignatures;
    }

    receive() external payable {
        emit Deposit(msg.sender, msg.value);
    }

    function submitTransaction(
        address _to,
        uint _value,
        bytes memory _data
    ) public onlyOwner {
        uint txIndex = transactions.length;
        transactions.push(
            Transaction({
                to: _to,
                value: _value,
                data: _data,
                executed: false,
                numConfirmations: 0
            })
        );

        emit SubmitTransaction(msg.sender, txIndex, _to, _value);
    }

    function confirmTransaction(
        uint _txIndex
    )
        public
        onlyOwner
        txExists(_txIndex)
        notExecuted(_txIndex)
        notConfirmed(_txIndex)
    {
        confirmations[_txIndex][msg.sender] = true;
        transactions[_txIndex].numConfirmations++;

        emit ConfirmTransaction(msg.sender, _txIndex);

        if (transactions[_txIndex].numConfirmations >= requiredSignatures) {
            executeTransaction(_txIndex);
        }
    }

    function executeTransaction(
        uint _txIndex
    ) public onlyOwner txExists(_txIndex) notExecuted(_txIndex) {
        require(
            transactions[_txIndex].numConfirmations >= requiredSignatures,
            "Not enough confirmations"
        );

        Transaction storage transaction = transactions[_txIndex];

        transaction.executed = true;
        (bool success, ) = transaction.to.call{value: transaction.value}(
            transaction.data
        );
        require(success, "Tx failed");

        emit ExecuteTransaction(msg.sender, _txIndex);
    }

    function getOwners() public view returns (address[] memory) {
        return owners;
    }

    function getTransactionCount() public view returns (uint) {
        return transactions.length;
    }

    function getTransaction(
        uint _txIndex
    )
        public
        view
        returns (
            address to,
            uint value,
            bytes memory data,
            bool executed,
            uint numConfirmations
        )
    {
        Transaction storage transaction = transactions[_txIndex];
        return (
            transaction.to,
            transaction.value,
            transaction.data,
            transaction.executed,
            transaction.numConfirmations
        );
    }
}
