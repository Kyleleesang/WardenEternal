const mocha = require('mocha');
const chai = require('chai');
const { assert, expect } = require('chai');
const ethers = require("ethers");
const Hardhat = require("hardhat");
require('dotenv').config();
const AlchemyApiKey = process.env.ALCHEMY_API_KEY;
const network = "goerli";


describe("Vault Tests", function () {
    before(async function () {
        const[owner, admin, signer, depositor, withdrawer] = await Hardhat.ethers.getSigners();
        const Vault = await Hardhat.ethers.getContractFactory("Vault");
        const VaultContract = await Vault.connect(owner).deploy();
        const MockERC20 = await Hardhat.ethers.getContractFactory("MockERC20");
        const MockERC20Contract = await MockERC20.deploy();
        return {VaultContract, MockERC20Contract, owner, admin, signer, depositor, withdrawer};
    });

    it("Should successfully whitelist a new token", async function () {
        const mockToken = MockERC20Contract.address;
        await expect(VaultContract.connect(owner).whitelistToken(mockToken));
    });

    it("Should successfully unwhitelist a new token", async function () {
        const mockToken = MockERC20Contract.address;
        await VaultContract.connect(owner).whitelistToken(mockToken);
        await expect(VaultContract.connect(owner).unwhitelistToken(mockToken));
    });

    it("Shouldn't let you deposit when the contract is paused", async function () {
        await VaultContract.connect(owner).pause();
        expect(await VaultContract.paused()).to.be.true;
        await VaultContract.connect(owner).unpause();
        expect(await VaultContract.paused()).to.be.false;
    });


    it("Shouldn't let you withdraw when the contract is paused", async function () {
        await MockERC20Contract.connect(depositor).mint(depositor.address, 100);
        await MockERC20Contract.connect(depositor).transfer(VaultContract.address, 100);
        await VaultContract.connect(owner).pause();
        expect(await VaultContract.paused()).to.be.true;
        await expect(VaultContract.connect(depositor).withdraw(50, MockERC20Contract.address)).to.be.reverted;
    });

    it("Should unpause the contract", async function () {
        await VaultContract.connect(owner).pause();
        expect(await VaultContract.paused()).to.be.true;
        await VaultContract.connect(owner).unpause();
        expect(await VaultContract.paused()).to.be.false;
    });

    it("Should let you deposit when the contract is unpaused", async function () {
        await VaultContract.connect(owner).pause();
        expect(await VaultContract.paused()).to.be.true;
        await VaultContract.connect(owner).unpause();
        expect(await VaultContract.paused()).to.be.false;
        await MockERC20Contract.connect(depositor).mint(depositor.address, 100);
        await MockERC20Contract.connect(depositor).transfer(VaultContract.address, 100);
    });

    it("Should let you withdraw when the contract is unpaused", async function () {
        await VaultContract.connect(owner).pause();
        expect(await VaultContract.paused()).to.be.true;
        await VaultContract.connect(owner).unpause();
        expect(await VaultContract.paused()).to.be.false;
        await MockERC20Contract.connect(depositor).mint(depositor.address, 100);
        await MockERC20Contract.connect(depositor).transfer(VaultContract.address, 100);
        await expect(VaultContract.connect(depositor).withdraw(50, MockERC20Contract.address));
    });
   
});