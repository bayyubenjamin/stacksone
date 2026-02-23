import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

describe("Token One (SIP-010) Test Suite", () => {
  it("ensures simnet is well initialised", () => {
    expect(simnet.blockHeight).toBeDefined();
  });

  describe("Token Metadata", () => {
    it("returns correct token name", () => {
      const { result } = simnet.callReadOnlyFn("token-one", "get-name", [], deployer);
      expect(result).toBeOk(Cl.stringAscii("Stacks One"));
    });

    it("returns correct token symbol", () => {
      const { result } = simnet.callReadOnlyFn("token-one", "get-symbol", [], deployer);
      expect(result).toBeOk(Cl.stringAscii("ONE"));
    });

    it("returns correct decimals", () => {
      const { result } = simnet.callReadOnlyFn("token-one", "get-decimals", [], deployer);
      expect(result).toBeOk(Cl.uint(6));
    });

    it("returns correct initial total supply (0)", () => {
      const { result } = simnet.callReadOnlyFn("token-one", "get-total-supply", [], deployer);
      expect(result).toBeOk(Cl.uint(0));
    });
  });

  describe("Minting and Balances", () => {
    it("allows contract owner to mint tokens", () => {
      const mintAmount = 1000000;
      
      const { result } = simnet.callPublicFn(
        "token-one",
        "mint",
        [Cl.uint(mintAmount), Cl.principal(wallet1)],
        deployer
      );
      
      expect(result).toBeOk(Cl.bool(true));

      // Verify wallet1 balance
      const balance = simnet.callReadOnlyFn("token-one", "get-balance", [Cl.principal(wallet1)], deployer);
      expect(balance.result).toBeOk(Cl.uint(mintAmount));
    });

    it("prevents unauthorized wallets from minting", () => {
      const { result } = simnet.callPublicFn(
        "token-one",
        "mint",
        [Cl.uint(1000000), Cl.principal(wallet2)],
        wallet1
      );
      
      expect(result).toBeErr(Cl.uint(101)); 
    });
  });

  describe("Transfers", () => {
    it("allows successful transfer between wallets", () => {
      // 1. Mint 1M tokens to wallet1
      simnet.callPublicFn("token-one", "mint", [Cl.uint(1000000), Cl.principal(wallet1)], deployer);

      // 2. Transfer 400k tokens from wallet1 to wallet2
      const { result } = simnet.callPublicFn(
        "token-one",
        "transfer",
        [Cl.uint(400000), Cl.principal(wallet1), Cl.principal(wallet2), Cl.none()],
        wallet1
      );
      expect(result).toBeOk(Cl.bool(true));

      // 3. Verify balances
      const bal1 = simnet.callReadOnlyFn("token-one", "get-balance", [Cl.principal(wallet1)], deployer);
      expect(bal1.result).toBeOk(Cl.uint(600000));

      const bal2 = simnet.callReadOnlyFn("token-one", "get-balance", [Cl.principal(wallet2)], deployer);
      expect(bal2.result).toBeOk(Cl.uint(400000));
    });

    it("prevents transfer if sender is not tx-sender", () => {
      simnet.callPublicFn("token-one", "mint", [Cl.uint(1000000), Cl.principal(wallet1)], deployer);

      // wallet2 tries to maliciously transfer wallet1's tokens
      const { result } = simnet.callPublicFn(
        "token-one",
        "transfer",
        [Cl.uint(100000), Cl.principal(wallet1), Cl.principal(wallet2), Cl.none()],
        wallet2
      );
      
      expect(result).toBeErr(Cl.uint(101));
    });
  });
});
