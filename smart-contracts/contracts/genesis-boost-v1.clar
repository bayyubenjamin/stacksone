;; ===============================
;; GENESIS BOOST V1
;; Modular XP Lock System
;; ===============================

(define-map locked-xp
  principal
  uint
)

(define-map boost-level
  principal
  uint
)

(define-read-only (get-locked (user principal))
  (default-to u0 (map-get? locked-xp user))
)

(define-read-only (get-boost (user principal))
  (default-to u0 (map-get? boost-level user))
)
(print { event: "score-update", user: tx-sender })

;; Lock XP (simulated)
(define-public (lock-xp (amount uint))
  (let (
        (current (default-to u0 (map-get? locked-xp tx-sender)))
       )
    (map-set locked-xp tx-sender (+ current amount))
    (map-set boost-level tx-sender (+ u1 (/ amount u100)))
    (ok true)
  )
)

;; Unlock XP
(define-public (unlock-xp)
  (begin
    (map-delete locked-xp tx-sender)
    (map-delete boost-level tx-sender)
    (ok true)
  )
)
