const mocha = require('mocha');
const chai = require('chai');
const { assert, expect } = require('chai');
const {ethers} = require("ethers");
const Hardhat = require("hardhat");
const hre = require("hardhat");
require('dotenv').config();
const AlchemyApiKey = process.env.ALCHEMY_API_KEY;
const network = "goerli";


describe("Vault Tests", function () {
    /*
    async function setupVault() {
        [owner, admin, signer, depositor, withdrawer] = await Hardhat.ethers.getSigners();
        //query balance of owner
        const Vault = await Hardhat.ethers.getContractFactory("Vault");
        const VaultContract = await Vault.connect(owner).deploy();
        const MockERC20 = await Hardhat.ethers.getContractFactory("MockERC20");
        const MockERC20Contract = await MockERC20.connect(owner).deploy(depositor.address, 1000);
        return { VaultContract, Vault, MockERC20Contract, owner, admin, signer, depositor, withdrawer };
    };
    */
   
    async function setupVault() {
        try {
            [owner, admin, signer, depositor, withdrawer] = await Hardhat.ethers.getSigners();
            const Vault = await Hardhat.ethers.getContractFactory("Vault");
            const VaultContract = await Vault.deploy();
            const MockERC20 = await Hardhat.ethers.getContractFactory("MockERC20");
            const MockERC20Contract = await MockERC20.deploy(depositor.address, 1000);
            return { VaultContract, MockERC20Contract, owner, admin, signer, depositor, withdrawer };
        } catch (error) {
            console.error("Error in setupVault:", error);
        }
    };
    
    it("Should deploy the contract", async function () {
        await expect(setupVault).to.not.be.reverted;
    });


    it("Should successfully whitelist a new token", async function () {
        const {VaultContract, MockERC20Contract, owner} = await setupVault();
        await expect(VaultContract.connect(owner).whiteListToken(MockERC20Contract.target)).to.not.be.reverted;
    });

    it("Should successfully unWhitelist a new token", async function () {
        const { VaultContract, owner, MockERC20Contract} = await setupVault();
        await VaultContract.connect(owner).whiteListToken(MockERC20Contract.target);
        await expect(VaultContract.connect(owner).unWhiteListToken(MockERC20Contract.target));
    });

    it("Shouldn't let you deposit when the contract is paused", async function () {
        const {VaultContract, MockERC20Contract, owner, depositor} = await setupVault();
        await VaultContract.connect(owner).whiteListToken(MockERC20Contract.target);
        await VaultContract.connect(owner).pause();
        expect(await VaultContract.paused()).to.be.true;
        await expect(VaultContract.connect(depositor).deposit(100, MockERC20Contract.target)).to.be.reverted;
    });

    it("Shouldn't let you withdraw when the contract is paused", async function () {
        const {VaultContract, MockERC20Contract, owner, depositor} = await setupVault();
        await VaultContract.connect(owner).whiteListToken(MockERC20Contract.target);
        await MockERC20Contract.connect(depositor).mint(depositor.address, 100);
        await MockERC20Contract.connect(depositor).transfer(VaultContract.target, 100);
        await VaultContract.connect(owner).pause();
        expect(await VaultContract.paused()).to.be.true;
        await expect(VaultContract.connect(depositor).withdraw(50, MockERC20Contract.target)).to.be.reverted;
    });

    it("Should unpause the contract", async function () {
        const {VaultContract, MockERC20Contract, owner, depositor} = await setupVault();
        await VaultContract.connect(owner).pause();
        expect(await VaultContract.paused()).to.be.true;
        await VaultContract.connect(owner).unpause();
        expect(await VaultContract.paused()).to.be.false;
    });

    it("Should let you deposit when the contract is unpaused", async function () {
        const {VaultContract, MockERC20Contract, owner, depositor} = await setupVault();
        await VaultContract.connect(owner).pause();
        expect(await VaultContract.paused()).to.be.true;
        await VaultContract.connect(owner).unpause();
        expect(await VaultContract.paused()).to.be.false;
        await VaultContract.connect(owner).whiteListToken(MockERC20Contract.target);
        await MockERC20Contract.connect(depositor).mint(depositor.address, 100);
        await MockERC20Contract.connect(depositor).transfer(VaultContract.target, 100);
    });

    it("Should let you withdraw when the contract is unpaused", async function () {
        const {VaultContract, MockERC20Contract, owner, depositor} = await setupVault();
        await VaultContract.connect(owner).pause();
        expect(await VaultContract.paused()).to.be.true;
        await VaultContract.connect(owner).unpause();
        expect(await VaultContract.paused()).to.be.false;
        await VaultContract.connect(owner).whiteListToken(MockERC20Contract.target);
        await MockERC20Contract.connect(depositor).mint(depositor.address, 100);
        await MockERC20Contract.connect(depositor).transfer(VaultContract.target, 100);
        await expect(VaultContract.connect(depositor).withdraw(50, MockERC20Contract.target));
    });

    it("Shouldn't let you deposit an unwhitelisted token", async function () {
        const {VaultContract, MockERC20Contract, owner, depositor} = await setupVault();
        await MockERC20Contract.connect(depositor).mint(depositor.address, 100);
        expect(await MockERC20Contract.connect(depositor).transfer(VaultContract.target, 100)).to.be.revertedWith("token not whitelisted");
    });

    it("Should let the owner add an admin", async function () {
        const {VaultContract, MockERC20Contract, owner, admin} = await setupVault();
        await expect(VaultContract.connect(owner).addAdmin(admin.address));
    });

    it("Shouldn't let a non admin access non admin functions", async function () {
        const {VaultContract, MockERC20Contract, owner, admin} = await setupVault();
        await expect(VaultContract.connect(depositor).addAdmin(admin.address)).to.be.revertedWith("Caller is not the owner or Admin");
    });
   
});