;; Config updated 2026-06-20T08:33:24Z
(define-constant ERR-UNAUTHORIZED (err u401))
(define-data-var config-version uint u10)

(define-read-only (get-config-version)
  (ok (var-get config-version))
)
