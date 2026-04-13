;; ChainTap - on-chain tapping game
;; Unlimited taps, all recorded on-chain

;; Global total taps
(define-data-var total-taps uint u0)

;; Per-user tap count
(define-map user-taps principal uint)

;; Top 10 leaderboard storage
(define-data-var top-1 {who: principal, taps: uint} {who: tx-sender, taps: u0})
(define-data-var top-2 {who: principal, taps: uint} {who: tx-sender, taps: u0})
(define-data-var top-3 {who: principal, taps: uint} {who: tx-sender, taps: u0})
(define-data-var top-4 {who: principal, taps: uint} {who: tx-sender, taps: u0})
(define-data-var top-5 {who: principal, taps: uint} {who: tx-sender, taps: u0})
(define-data-var top-6 {who: principal, taps: uint} {who: tx-sender, taps: u0})
(define-data-var top-7 {who: principal, taps: uint} {who: tx-sender, taps: u0})
(define-data-var top-8 {who: principal, taps: uint} {who: tx-sender, taps: u0})
(define-data-var top-9 {who: principal, taps: uint} {who: tx-sender, taps: u0})
(define-data-var top-10 {who: principal, taps: uint} {who: tx-sender, taps: u0})

;; Main tap function
(define-public (tap)
  (let
    (
      (caller tx-sender)
      (current (default-to u0 (map-get? user-taps caller)))
      (new-count (+ current u1))
    )
    ;; Update user taps
    (map-set user-taps caller new-count)
    ;; Update global counter
    (var-set total-taps (+ (var-get total-taps) u1))
    ;; Update leaderboard
    (update-leaderboard caller new-count)
    (ok new-count)
  )
)

;; Leaderboard update - bubble insert
(define-private (update-leaderboard (who principal) (taps uint))
  (begin
    (if (>= taps (get taps (var-get top-10)))
      (begin
        (var-set top-10 {who: who, taps: taps})
        (bubble-up-9)
      )
      true
    )
    true
  )
)

(define-private (bubble-up-9)
  (if (>= (get taps (var-get top-10)) (get taps (var-get top-9)))
    (let ((tmp (var-get top-9)))
      (var-set top-9 (var-get top-10))
      (var-set top-10 tmp)
      (bubble-up-8)
    )
    true
  )
)

(define-private (bubble-up-8)
  (if (>= (get taps (var-get top-9)) (get taps (var-get top-8)))
    (let ((tmp (var-get top-8)))
      (var-set top-8 (var-get top-9))
      (var-set top-9 tmp)
      (bubble-up-7)
    )
    true
  )
)

(define-private (bubble-up-7)
  (if (>= (get taps (var-get top-8)) (get taps (var-get top-7)))
    (let ((tmp (var-get top-7)))
      (var-set top-7 (var-get top-8))
      (var-set top-8 tmp)
      (bubble-up-6)
    )
    true
  )
)

(define-private (bubble-up-6)
  (if (>= (get taps (var-get top-7)) (get taps (var-get top-6)))
    (let ((tmp (var-get top-6)))
      (var-set top-6 (var-get top-7))
      (var-set top-7 tmp)
      (bubble-up-5)
    )
    true
  )
)

(define-private (bubble-up-5)
  (if (>= (get taps (var-get top-6)) (get taps (var-get top-5)))
    (let ((tmp (var-get top-5)))
      (var-set top-5 (var-get top-6))
      (var-set top-6 tmp)
      (bubble-up-4)
    )
    true
  )
)

(define-private (bubble-up-4)
  (if (>= (get taps (var-get top-5)) (get taps (var-get top-4)))
    (let ((tmp (var-get top-4)))
      (var-set top-4 (var-get top-5))
      (var-set top-5 tmp)
      (bubble-up-3)
    )
    true
  )
)

(define-private (bubble-up-3)
  (if (>= (get taps (var-get top-4)) (get taps (var-get top-3)))
    (let ((tmp (var-get top-3)))
      (var-set top-3 (var-get top-4))
      (var-set top-4 tmp)
      (bubble-up-2)
    )
    true
  )
)

(define-private (bubble-up-2)
  (if (>= (get taps (var-get top-3)) (get taps (var-get top-2)))
    (let ((tmp (var-get top-2)))
      (var-set top-2 (var-get top-3))
      (var-set top-3 tmp)
      (bubble-up-1)
    )
    true
  )
)

(define-private (bubble-up-1)
  (if (>= (get taps (var-get top-2)) (get taps (var-get top-1)))
    (let ((tmp (var-get top-1)))
      (var-set top-1 (var-get top-2))
      (var-set top-2 tmp)
      true
    )
    true
  )
)

;; Read-only functions

(define-read-only (get-total-taps)
  (var-get total-taps)
)

(define-read-only (get-user-taps (user principal))
  (default-to u0 (map-get? user-taps user))
)

(define-read-only (get-leaderboard)
  (list
    (var-get top-1)
    (var-get top-2)
    (var-get top-3)
    (var-get top-4)
    (var-get top-5)
    (var-get top-6)
    (var-get top-7)
    (var-get top-8)
    (var-get top-9)
    (var-get top-10)
  )
)
