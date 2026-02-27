;; genesis-leaderboard-v1

(define-map leaderboard
  principal
  {
    score: uint
  }
)

(define-data-var owner principal tx-sender)

;; =========================
;; Error Codes
;; =========================

(define-constant err-not-owner (err u100))
(define-constant err-invalid-amount (err u101))

;; =========================
;; Public Functions
;; =========================

(define-public (add-score (amount uint))
  (begin
    (asserts! (> amount u0) err-invalid-amount)

    (let (
          (current
            (default-to
              { score: u0 }
              (map-get? leaderboard tx-sender)
            )
          )
         )
      (map-set leaderboard tx-sender
        {
          score: (+ (get score current) amount)
        }
      )
    )

    (print { event: "leaderboard-update", user: tx-sender, amount: amount })

    (ok true)
  )
)

;; =========================
;; Read Only
;; =========================

(define-read-only (get-score (user principal))
  (default-to
    { score: u0 }
    (map-get? leaderboard user)
  )
)

(define-read-only (get-rank-tier (user principal))
  (let (
        (data
          (default-to
            { score: u0 }
            (map-get? leaderboard user)
          )
        )
       )
    (let ((score (get score data)))
      (if (>= score u1000)
          u3
          (if (>= score u500)
              u2
              (if (>= score u100)
                  u1
                  u0))))
  )
)

;; =========================
;; Admin
;; =========================

(define-public (reset-season)
  (begin
    (asserts! (is-eq tx-sender (var-get owner)) err-not-owner)
    (ok true)
  )
)
