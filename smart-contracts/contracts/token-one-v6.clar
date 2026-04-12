;; token-one-v6.clar
(define-fungible-token one)

(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-authorized (err u101))

(define-map approved-minters principal bool)

(define-read-only (get-balance (who principal))
  (ok (ft-get-balance one who))
)

(define-read-only (get-total-supply)
  (ok (ft-get-supply one))
)

(define-public (transfer (amount uint) (sender principal) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender sender) err-not-authorized)
    (ft-transfer? one amount sender recipient)
  )
)

(define-public (mint (amount uint) (recipient principal))
  (let
    (
      (is-approved (default-to false (map-get? approved-minters tx-sender)))
    )
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

(define-public (ping-58)
  (ok true))

(define-public (ping-1)
  (ok true))

(define-public (ping-116)
  (ok true))

(define-public (ping-146)
  (ok true))
