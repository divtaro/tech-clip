export default function ArticleDetailLoading() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    </div>
  )
}
