// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MerchantPayment {
    address public owner;

    struct Merchant {
        uint256 settlementTime; //The settlement time ensures that payments are processed at the correct time, allowing for scheduled and automated transactions.
        uint256 merchantPercentage; //The merchant percentage determines the share of the payment that the merchant receives, ensuring that the correct amount is distributed according to the agreed terms.
        uint256 companyPercentage; //The company percentage defines the portion of the payment that the company keeps, allowing for revenue sharing and covering operational costs.
    }

    mapping(address => Merchant) public merchants;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function setMerchantDetails(
        address _merchant,
        uint256 _settlementTime,
        uint256 _merchantPercentage,
        uint256 _companyPercentage
    ) public onlyOwner {
        require(_merchantPercentage + _companyPercentage == 100, "Percentages must add up to 100");
        merchants[_merchant] = Merchant(_settlementTime, _merchantPercentage, _companyPercentage);
    }

    function distributePayment(address _merchant) public payable {
        Merchant memory merchant = merchants[_merchant];
        require(block.timestamp >= merchant.settlementTime, "Settlement time not reached");

        uint256 merchantAmount = (msg.value * merchant.merchantPercentage) / 100;
        uint256 companyAmount = (msg.value * merchant.companyPercentage) / 100;

        payable(_merchant).transfer(merchantAmount);
        payable(owner).transfer(companyAmount);
    }

    function updateSettlementTime(address _merchant, uint256 _newSettlementTime) public onlyOwner {
        merchants[_merchant].settlementTime = _newSettlementTime;
    }
}