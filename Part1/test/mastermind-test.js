//[assignment] write your own unit test to show that your Mastermind variation circuit is working as expected
const chai = require("chai");
const path = require("path");
const { isTypedArray } = require("util/types");
const buildPoseidon = require("circomlibjs").buildPoseidon;
const wasm_tester = require("circom_tester").wasm;
const F1Field = require("ffjavascript").F1Field; // finite field library
const Scalar = require("ffjavascript").Scalar;

const p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(p);

const assert = chai.assert;

describe("MastermindVariation Test", function() {
    this.timeout(100000000);

    it("Correct Solution Found", async () => {
        // set solution
        const privSolnA = 1;
        const privSolnB = 2;
        const privSolnC = 3;
        const privSalt = 12306;

        // set public hash based on solution
        this.poseidon = await buildPoseidon();
        const pubSolnHash = this.poseidon([privSalt,privSolnA,privSolnB,privSolnC]);

        const circuit = await wasm_tester("contracts/circuits/MastermindVariation.circom");
        await circuit.loadConstraints();

        const INPUT = {
            "pubGuessA": privSolnA, 
            "pubGuessB": privSolnB,
            "pubGuessC": privSolnC, 
            "pubNumHit": 3, 
            "pubNumBlow": 0, 
            "pubSolnHash": this.poseidon.F.toObject(pubSolnHash), 
            "privSolnA": privSolnA, 
            "privSolnB": privSolnB, 
            "privSolnC": privSolnC, 
            "privSalt": privSalt
        }

        const witness = await circuit.calculateWitness(INPUT, true);
        assert(Fr.eq(Fr.e(witness[0]),Fr.e(1)));
    })

    it("Wrong Solution, 1 hit, 2 blows", async () => {
        // set solution
        const privSolnA = 1;
        const privSolnB = 2;
        const privSolnC = 3;
        const privSalt = 12306;

        // set public hash based on solution
        this.poseidon = await buildPoseidon();
        const pubSolnHash = this.poseidon([privSalt,privSolnA,privSolnB,privSolnC]);

        const circuit = await wasm_tester("contracts/circuits/MastermindVariation.circom");
        await circuit.loadConstraints();

        const INPUT = {
            "pubGuessA": 2, 
            "pubGuessB": 1,
            "pubGuessC": 3, 
            "pubNumHit": 1, 
            "pubNumBlow": 2, 
            "pubSolnHash": this.poseidon.F.toObject(pubSolnHash), 
            "privSolnA": privSolnA, 
            "privSolnB": privSolnB, 
            "privSolnC": privSolnC, 
            "privSalt": privSalt
        }

        const witness = await circuit.calculateWitness(INPUT, true);

        assert(Fr.eq(Fr.e(witness[0]),Fr.e(1)));
    })

    it("Wrong Solution, 0 hit, 0 blow", async () => {
        // set solution
        const privSolnA = 1;
        const privSolnB = 2;
        const privSolnC = 3;
        const privSalt = 12306;

        // set public hash based on solution
        this.poseidon = await buildPoseidon();
        const pubSolnHash = this.poseidon([privSalt,privSolnA,privSolnB,privSolnC]);

        const circuit = await wasm_tester("contracts/circuits/MastermindVariation.circom");
        await circuit.loadConstraints();

        const INPUT = {
            "pubGuessA": 4, 
            "pubGuessB": 5,
            "pubGuessC": 6, 
            "pubNumHit": 0, 
            "pubNumBlow": 0, 
            "pubSolnHash": this.poseidon.F.toObject(pubSolnHash), 
            "privSolnA": privSolnA, 
            "privSolnB": privSolnB, 
            "privSolnC": privSolnC, 
            "privSalt": privSalt
        }

        const witness = await circuit.calculateWitness(INPUT, true);

        assert(Fr.eq(Fr.e(witness[0]),Fr.e(1)));
    })
}) 