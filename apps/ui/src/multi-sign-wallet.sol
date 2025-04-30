// SPDX-License-Identifier: MIT
pragma solidity 0.8.29;

contract MultiSignWallet {
    uint256 private constant _MAX_OWNERS = 10;
    uint256 private constant _MAX_PENDING_TX = 50;
    address[] public owners;
    mapping(address => bool) public isOwner;
    uint public requiredSignatures;
    bool public isLocked;

    struct Transaction {
        address to;
        uint value;
        bytes data;
        bool executed;
        uint numConfirmations;
        bool isDestroy;
    }

    Transaction[] public transactions;
    mapping(uint => mapping(address => bool)) public confirmations;

    event Deposit(address indexed sender, uint amount);
    event ContractLocked(address indexed initiator);
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

    modifier notLocked() {
        require(!isLocked, "Contract is locked");
        _;
    }

    constructor(address[] memory _owners, uint _requiredSignatures) payable {
        uint _ownersCount = _owners.length;
        require(_ownersCount > 0, "Owners required");
        require(_ownersCount < _MAX_OWNERS, "Too many owners");
        require(_requiredSignatures > 0, "Invalid required signatures");
        require(
            _requiredSignatures <= _ownersCount,
            "Invalid required signatures"
        );

        unchecked {
            for (uint256 i = 0; i < _ownersCount; ++i) {
                address owner = _owners[i];
                require(owner != address(0), "Zero address");
                require(!isOwner[owner], "Duplicate owner");

                isOwner[owner] = true;
                owners.push(owner);
            }
        }

        requiredSignatures = _requiredSignatures;
    }

    receive() external payable {
        emit Deposit(msg.sender, msg.value);
    }

    function isTxConfirmed(
        uint _txIndex,
        address _owner
    ) public view returns (bool) {
        return confirmations[_txIndex][_owner];
    }

    function submitTransaction(
        address _to,
        uint _value,
        bytes memory _data,
        bool isDestroy
    ) public onlyOwner notLocked {
        uint _txIndex = transactions.length;
        require(_txIndex < _MAX_PENDING_TX, "Too many pending tx");
        require(getBalance() > _value, "Insufficient contract balance");

        transactions.push(
            Transaction({
                to: _to,
                value: _value,
                data: _data,
                executed: false,
                numConfirmations: 0,
                isDestroy: isDestroy
            })
        );

        emit SubmitTransaction(msg.sender, _txIndex, _to, _value);
    }

    function _executeTransaction(uint _txIndex) private {
        Transaction storage transaction = transactions[_txIndex];
        require(
            transaction.numConfirmations ==
                (transaction.isDestroy ? owners.length : requiredSignatures),
            "Insufficient confirmations"
        );

        transaction.executed = true;

        if (transaction.isDestroy) {
            (bool success, ) = payable(transaction.to).call{
                value: getBalance()
            }(transaction.data);
            emit ContractLocked(msg.sender);
            isLocked = true;
            require(success, "Lock Tx failed");
        } else {
            (bool success, ) = payable(transaction.to).call{
                value: transaction.value
            }(transaction.data);
            require(success, "Tx failed");
            emit ExecuteTransaction(msg.sender, _txIndex);
        }
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
        uint _requiredConfirmations = transaction.isDestroy
            ? owners.length
            : requiredSignatures;
        if (transaction.numConfirmations == _requiredConfirmations) {
            _executeTransaction(_txIndex);
        }
    }

    function getOwners() public view returns (address[] memory) {
        return owners;
    }

    function getTransactionCount() public view returns (uint) {
        return transactions.length;
    }

    function getBalance() public view returns (uint256) {
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
        Transaction storage t = transactions[_txIndex];
        to = t.to;
        value = t.value;
        data = t.data;
        executed = t.executed;
        numConfirmations = t.numConfirmations;
        isDestroy = t.isDestroy;
    }
}
