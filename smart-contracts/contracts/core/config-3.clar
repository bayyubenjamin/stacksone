;; Config updated 2026-05-29T14:39:22Z
(define-constant ERR-UNAUTHORIZED (err u401))
(define-data-var config-version uint u14)

(define-read-only (get-config-version)
  (ok (var-get config-version))
)
