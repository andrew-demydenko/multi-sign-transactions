// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MultiSigWallet {
    address[] public owners;
    mapping(address => bool) public isOwner;
    uint public requiredSignatures;
    bool public isLocked = false; // Флаг для блокировки контракта

    struct Transaction {
        address to;
        uint value;
        bytes data;
        bool executed;
        uint numConfirmations;
        bool isDestroy; // Флаг для удаления контракта
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
    event SubmitLockTrasaction(
        address indexed owner,
        uint indexed txIndex,
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

    modifier notLocked() {
        require(!isLocked, "Contract is locked");
        _;
    }

    constructor(address[] memory _owners, uint _requiredSignatures) payable {
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

    function submitLockTrasaction() public onlyOwner notLocked {
        uint txIndex = transactions.length;

        transactions.push(
            Transaction({
                to: address(0),
                value: 0,
                data: "",
                executed: false,
                numConfirmations: 0,
                isDestroy: true
            })
        );

        emit SubmitLockTrasaction(msg.sender, txIndex, address(this).balance);
    }

    function submitTransaction(
        address _to,
        uint _value,
        bytes memory _data
    ) public onlyOwner notLocked {
        uint txIndex = transactions.length;
        transactions.push(
            Transaction({
                to: _to,
                value: _value,
                data: _data,
                executed: false,
                numConfirmations: 0,
                isDestroy: false
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
        notLocked
    {
        confirmations[_txIndex][msg.sender] = true;
        transactions[_txIndex].numConfirmations++;

        emit ConfirmTransaction(msg.sender, _txIndex);

        Transaction storage transaction = transactions[_txIndex];
        uint requiredConfirmations = transaction.isDestroy
            ? owners.length
            : requiredSignatures;
        if (transaction.numConfirmations >= requiredConfirmations) {
            executeTransaction(_txIndex);
        }
    }

    function executeTransaction(
        uint _txIndex
    ) public onlyOwner txExists(_txIndex) notExecuted(_txIndex) notLocked {
        Transaction storage transaction = transactions[_txIndex];

        if (transaction.isDestroy) {
            require(
                transaction.numConfirmations == owners.length,
                "Not all owners have confirmed for destroy"
            );
        } else {
            require(
                transaction.numConfirmations >= requiredSignatures,
                "Not enough confirmations"
            );
        }

        transaction.executed = true;

        if (transaction.isDestroy) {
            isLocked = true; // Блокируем контракт
            (bool success, ) = payable(msg.sender).call{
                value: address(this).balance
            }("");
            require(success, "Tx failed during destroy");
        } else {
            (bool success, ) = payable(transaction.to).call{
                value: transaction.value
            }(transaction.data);
            require(success, "Tx failed");
        }

        emit ExecuteTransaction(msg.sender, _txIndex);
    }

    function getOwners() public view returns (address[] memory) {
        return owners;
    }

    function getTransactionCount() public view returns (uint) {
        return transactions.length;
    }

    function getBalance() public view returns (uint) {
        return address(this).balance;
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
            uint numConfirmations,
            bool isDestroy
        )
    {
        Transaction storage transaction = transactions[_txIndex];
        return (
            transaction.to,
            transaction.value,
            transaction.data,
            transaction.executed,
            transaction.numConfirmations,
            transaction.isDestroy
        );
    }
}
