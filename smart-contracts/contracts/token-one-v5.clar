;; token-one-v5.clar
;; @version 2

(define-fungible-token one)

(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-authorized (err u101))

(define-map approved-minters principal bool)

;; Standard SIP-010 Functions
(define-read-only (get-name) (ok "StacksOne Token"))
(define-read-only (get-symbol) (ok "ONE"))
(define-read-only (get-decimals) (ok u6))
(define-read-only (get-token-uri) (ok none))

(define-read-only (get-balance (who principal))
  (ok (ft-get-balance one who))
)

(define-read-only (get-total-supply)
  (ok (ft-get-supply one))
)

(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
  (begin
    (asserts! (is-eq tx-sender sender) err-not-authorized)
    (try! (ft-transfer? one amount sender recipient))
    (match memo to-print (print to-print) 0)
    (ok true)
  )
)

(define-public (mint (amount uint) (recipient principal))
  (let
    (
      (is-approved (default-to false (map-get? approved-minters tx-sender)))
    )
    ;; Tx-sender di sini akan menjadi alamat kontrak Faucet/Staking jika dipanggil via as-contract
    (asserts! (or (is-eq tx-sender contract-owner) is-approved) err-not-authorized)
    (ft-mint? one amount recipient)
  )
)

(define-public (add-minter (minter principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (map-set approved-minters minter true))
  )
)

(define-public (ping-142)
  (ok true))

(define-public (ping-122)
  (ok true))

(define-public (ping-30)
  (ok true))

(define-public (ping-110)
  (ok true))

(define-public (ping-27)
  (ok true))

(define-public (ping-46)
  (ok true))

(define-public (ping-7)
  (ok true))

(define-public (ping-127)
  (ok true))
