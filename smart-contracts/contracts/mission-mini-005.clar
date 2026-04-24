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

(define-public (ping-8)
  (ok true))

(define-public (ping-19)
  (ok true))

(define-public (ping-141)
  (ok true))

(define-public (ping-185)
  (ok true))

(define-public (ping-88)
  (ok true))
