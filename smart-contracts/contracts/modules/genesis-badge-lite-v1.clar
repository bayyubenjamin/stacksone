;; genesis-badge-lite-v1

(define-map badges
  principal
  bool)

(define-public (claim)
  (begin
    (map-set badges tx-sender true)
    (ok true)
  )
)

(define-read-only (has-badge (user principal))
  (default-to false
    (map-get? badges user))
)
