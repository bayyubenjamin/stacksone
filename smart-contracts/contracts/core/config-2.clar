;; Config updated 2026-06-14T09:16:22Z
(define-constant ERR-UNAUTHORIZED (err u401))
(define-data-var config-version uint u19)

(define-read-only (get-config-version)
  (ok (var-get config-version))
)
