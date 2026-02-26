import { Clarinet, Tx, Chain, Account, types } from "clarinet";

Clarinet.test({
  name: "Initialize and increase reputation",
  async fn(chain: Chain, accounts: Map<string, Account>) {

    const deployer = accounts.get("deployer")!;
    const wallet1 = accounts.get("wallet_1")!;

    let block = chain.mineBlock([
      Tx.contractCall(
        "reputation-engine",
        "init-user",
        [types.principal(wallet1.address)],
        wallet1.address
      )
    ]);

    block.receipts[0].result.expectOk();

    block = chain.mineBlock([
      Tx.contractCall(
        "reputation-engine",
        "increase-score",
        [types.principal(wallet1.address), types.uint(100)],
        deployer.address
      )
    ]);

    block.receipts[0].result.expectOk();

    let call = chain.callReadOnlyFn(
      "reputation-engine",
      "get-user",
      [types.principal(wallet1.address)],
      deployer.address
    );

    call.result.expectSome();
  }
});
