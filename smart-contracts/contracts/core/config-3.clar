;; Config updated 2026-05-28T12:01:44Z
(define-constant ERR-UNAUTHORIZED (err u401))
(define-data-var config-version uint u20)

(define-read-only (get-config-version)
  (ok (var-get config-version))
)
