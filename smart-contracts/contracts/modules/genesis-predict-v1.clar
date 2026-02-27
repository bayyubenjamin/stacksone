;; GENESIS PREDICTION V1

(define-map predictions principal uint)

(define-read-only (get-prediction (user principal))
  (default-to u0 (map-get? predictions user))
)

(define-public (predict (number uint))
  (begin
    (map-set predictions tx-sender number)
    (ok true)
  )
)
