;; genesis-points-v1

(define-map points
  principal
  { total: uint })

(define-public (add (amount uint))
  (let (
        (current (default-to { total: u0 }
                  (map-get? points tx-sender)))
       )
    (map-set points tx-sender
      { total: (+ (get total current) amount) })
    (ok true)
  )
)

(define-read-only (get-points (user principal))
  (default-to { total: u0 }
    (map-get? points user))
)
