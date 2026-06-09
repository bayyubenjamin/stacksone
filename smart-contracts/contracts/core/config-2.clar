;; Config updated 2026-06-09T11:26:55Z
(define-constant ERR-UNAUTHORIZED (err u401))
(define-data-var config-version uint u27)

(define-read-only (get-config-version)
  (ok (var-get config-version))
)
