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

(define-public (ping-12)
  (ok true))

(define-public (ping-24)
  (ok true))

(define-public (ping-33)
  (ok true))

(define-public (ping-185)
  (ok true))

(define-public (ping-194)
  (ok true))
