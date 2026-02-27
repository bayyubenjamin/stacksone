;; GENESIS LUCKY DRAW V1

(define-map user-rolls principal uint)

(define-read-only (get-rolls (user principal))
  (default-to u0 (map-get? user-rolls user))
)

(define-public (roll)
  (let (
        (current (default-to u0 (map-get? user-rolls tx-sender)))
       )
    (map-set user-rolls tx-sender (+ current u1))
    (ok true)
  )
)
