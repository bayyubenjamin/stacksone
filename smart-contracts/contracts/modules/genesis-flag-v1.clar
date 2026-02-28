;; genesis-flag-v1

(define-map flags
  principal
  { active: bool })

(define-public (toggle)
  (let (
        (current (default-to { active: false }
                  (map-get? flags tx-sender)))
       )
    (map-set flags tx-sender
      { active: (not (get active current)) })
    (ok true)
  )
)

(define-read-only (get-flag (user principal))
  (default-to { active: false }
    (map-get? flags user))
)
