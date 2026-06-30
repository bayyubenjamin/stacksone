import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

describe("Reputation Engine", () => {
  it("initializes a user and increases reputation through an admin", () => {
    const initialized = simnet.callPublicFn(
      "reputation-engine",
      "init-user",
      [Cl.principal(wallet1)],
      wallet1,
    );
    expect(initialized.result).toBeOk(Cl.bool(true));

    const increased = simnet.callPublicFn(
      "reputation-engine",
      "increase-score",
      [Cl.principal(wallet1), Cl.uint(100)],
      deployer,
    );
    expect(increased.result).toBeOk(Cl.bool(true));

    const user = simnet.callReadOnlyFn(
      "reputation-engine",
      "get-user",
      [Cl.principal(wallet1)],
      deployer,
    );
    expect(user.result).toBeSome(
      Cl.tuple({
        score: Cl.uint(100),
        multiplier: Cl.uint(2),
      }),
    );
  });

  it("rejects reputation increases from non-admin wallets", () => {
    simnet.callPublicFn(
      "reputation-engine",
      "init-user",
      [Cl.principal(wallet1)],
      wallet1,
    );

    const result = simnet.callPublicFn(
      "reputation-engine",
      "increase-score",
      [Cl.principal(wallet1), Cl.uint(50)],
      wallet2,
    );

    expect(result.result).toBeErr(Cl.uint(100));
  });
});
