;; mission-mini-001.clar

(define-data-var counter uint u0)

(define-public (ping)
  (begin
    (var-set counter (+ (var-get counter) u1))
    (ok (var-get counter))
  )
)

(define-read-only (get-counter)
  (ok (var-get counter))
)

(define-public (ping-79)
  (ok true))

(define-public (ping-30)
  (ok true))

(define-public (ping-180)
  (ok true))

(define-public (ping-95)
  (ok true))
