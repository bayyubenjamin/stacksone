;; genesis-score-lite-v1

(define-map scores
  principal
  { score: uint })

(define-public (add-score (amount uint))
  (let (
        (current (default-to { score: u0 }
                  (map-get? scores tx-sender)))
       )
    (map-set scores tx-sender
      { score: (+ (get score current) amount) })
    (ok true)
  )
)

(define-read-only (get-score (user principal))
  (default-to { score: u0 }
    (map-get? scores user))
)
