;; genesis-counter-v1

(define-map counters
  principal
  { value: uint })

(define-public (increment)
  (let (
        (current (default-to { value: u0 }
                  (map-get? counters tx-sender)))
       )
    (map-set counters tx-sender
      { value: (+ (get value current) u1) })
    (ok true)
  )
)

(define-read-only (get-count (user principal))
  (default-to { value: u0 }
    (map-get? counters user))
)
