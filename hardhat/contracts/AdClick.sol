// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract AdClickRewards {
    struct User {
        uint256 dailyEarnings;
        uint256 lastClaimDate;
        mapping(string => bool) clickedAds;
    }

    mapping(address => User) public users;
    address public owner;
    uint256 public maxDailyEarnings = 0.01 ether;
    uint256 public rewardPerClick = 0.0001 ether;

    event AdClicked(address indexed user, string adId, uint256 reward);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the contract owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function clickAd(string memory adId) external {
        User storage user = users[msg.sender];

        if (block.timestamp > user.lastClaimDate + 1 days) {
            user.dailyEarnings = 0;
            user.lastClaimDate = block.timestamp;
        }

        require(!user.clickedAds[adId], "Already clicked this ad");
        require(user.dailyEarnings + rewardPerClick <= maxDailyEarnings, "Daily limit reached");

        user.clickedAds[adId] = true;
        user.dailyEarnings += rewardPerClick;

        payable(msg.sender).transfer(rewardPerClick);
        emit AdClicked(msg.sender, adId, rewardPerClick);
    }

    function fundContract() external payable onlyOwner {}

    function setMaxDailyEarnings(uint256 _amount) external onlyOwner {
        maxDailyEarnings = _amount;
    }

    function setRewardPerClick(uint256 _amount) external onlyOwner {
        rewardPerClick = _amount;
    }
}