;; Config updated 2026-06-14T10:35:58Z
(define-constant ERR-UNAUTHORIZED (err u401))
(define-data-var config-version uint u24)

(define-read-only (get-config-version)
  (ok (var-get config-version))
)
