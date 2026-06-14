;; Config updated 2026-06-14T12:12:58Z
(define-constant ERR-UNAUTHORIZED (err u401))
(define-data-var config-version uint u31)

(define-read-only (get-config-version)
  (ok (var-get config-version))
)
