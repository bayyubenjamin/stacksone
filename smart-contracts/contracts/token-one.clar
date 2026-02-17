;; token-one.clar
;; Token Bernilai Tinggi / Reward Utama (SIP-010 Standard)

(impl-trait 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE.sip-010-trait-ft-standard.sip-010-trait)

(define-fungible-token token-one)

(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-authorized (err u101))

(define-map approved-minters principal bool)

(define-read-only (get-balance (who principal))
  (ok (ft-get-balance token-one who))
)

(define-read-only (get-total-supply)
  (ok (ft-get-supply token-one))
)

(define-read-only (get-name)
  (ok "Stacks One")
)

(define-read-only (get-symbol)
  (ok "ONE")
)

(define-read-only (get-decimals)
  (ok u6)
)

(define-read-only (get-token-uri)
  (ok none)
)

(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
  (begin
    (asserts! (is-eq tx-sender sender) (err u101))
    (try! (ft-transfer? token-one amount sender recipient))
    (match memo to-print (print to-print) 0x)
    (ok true)
  )
)

(define-public (mint (amount uint) (recipient principal))
  (let
    (
      (is-approved (default-to false (map-get? approved-minters tx-sender)))
    )
    (asserts! (or (is-eq tx-sender contract-owner) is-approved) err-not-authorized)
    (ft-mint? token-one amount recipient)
  )
)

(define-public (add-minter (minter principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (map-set approved-minters minter true))
  )
)
