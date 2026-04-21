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

(define-public (ping-27)
  (ok true))

(define-public (ping-22)
  (ok true))

(define-public (ping-49)
  (ok true))

(define-public (ping-14)
  (ok true))

(define-public (ping-120)
  (ok true))
