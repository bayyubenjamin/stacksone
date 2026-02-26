;; ===============================
;; StacksOne Reputation Engine
;; NO BLOCK HEIGHT VERSION
;; ===============================

(define-constant CONTRACT-OWNER tx-sender)

(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-USER-NOT-FOUND (err u101))
(define-constant ERR-INVALID-AMOUNT (err u102))

;; ===============================
;; DATA MAPS
;; ===============================

(define-map user-reputation
  principal
  {
    score: uint,
    multiplier: uint
  }
)

(define-map admins
  principal
  bool
)

;; ===============================
;; INTERNAL CHECKS
;; ===============================

(define-private (is-admin (user principal))
  (or
    (is-eq user CONTRACT-OWNER)
    (default-to false (map-get? admins user))
  )
)

(define-private (assert-admin)
  (if (is-admin tx-sender)
      (ok true)
      ERR-NOT-AUTHORIZED
  )
)

;; ===============================
;; READ
;; ===============================

(define-read-only (get-user (user principal))
  (map-get? user-reputation user)
)

;; ===============================
;; PUBLIC
;; ===============================

(define-public (add-admin (new-admin principal))
  (begin
    (try! (assert-admin))
    (map-set admins new-admin true)
    (ok true)
  )
)

(define-public (init-user (user principal))
  (begin
    (map-set user-reputation user {
      score: u0,
      multiplier: u1
    })
    (ok true)
  )
)

(define-public (increase-score (user principal) (amount uint))
  (begin
    (try! (assert-admin))

    (if (is-eq amount u0)
        ERR-INVALID-AMOUNT
        (match (map-get? user-reputation user)
          user-data
            (let (
                  (new-score (+ (get score user-data) amount))
                  (new-multiplier (+ u1 (/ new-score u100)))
                 )
              (map-set user-reputation user {
                score: new-score,
                multiplier: new-multiplier
              })
              (ok true)
            )
          ERR-USER-NOT-FOUND
        )
    )
  )
)

(define-public (decay (user principal))
  (match (map-get? user-reputation user)
    user-data
      (let (
            (score (get score user-data))
            (decayed (/ score u20))
           )
        (map-set user-reputation user {
          score: (- score decayed),
          multiplier: (get multiplier user-data)
        })
        (ok true)
      )
    ERR-USER-NOT-FOUND
  )
)
