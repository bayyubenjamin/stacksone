;; Config updated 2026-06-17T04:49:53Z
(define-constant ERR-UNAUTHORIZED (err u401))
(define-data-var config-version uint u14)

(define-read-only (get-config-version)
  (ok (var-get config-version))
)
