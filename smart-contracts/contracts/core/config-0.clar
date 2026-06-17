;; Config updated 2026-06-17T02:14:13Z
(define-constant ERR-UNAUTHORIZED (err u401))
(define-data-var config-version uint u3)

(define-read-only (get-config-version)
  (ok (var-get config-version))
)
