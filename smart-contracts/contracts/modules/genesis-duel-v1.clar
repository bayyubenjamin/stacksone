;; GENESIS DUEL V1

(define-map duel-score principal uint)

(define-read-only (get-score (user principal))
  (default-to u0 (map-get? duel-score user))
)

(define-public (fight)
  (let (
        (current (default-to u0 (map-get? duel-score tx-sender)))
       )
    (map-set duel-score tx-sender (+ current u10))
    (ok true)
  )
)
