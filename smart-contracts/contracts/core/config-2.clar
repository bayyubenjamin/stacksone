;; Config updated 2026-06-06T05:59:04Z
(define-constant ERR-UNAUTHORIZED (err u401))
(define-data-var config-version uint u1)

(define-read-only (get-config-version)
  (ok (var-get config-version))
)
