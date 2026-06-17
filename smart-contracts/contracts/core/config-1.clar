;; Config updated 2026-06-17T02:25:44Z
(define-constant ERR-UNAUTHORIZED (err u401))
(define-data-var config-version uint u4)

(define-read-only (get-config-version)
  (ok (var-get config-version))
)
