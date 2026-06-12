;; Config updated 2026-06-12T17:53:55Z
(define-constant ERR-UNAUTHORIZED (err u401))
(define-data-var config-version uint u44)

(define-read-only (get-config-version)
  (ok (var-get config-version))
)
